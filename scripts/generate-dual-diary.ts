import fs from "fs/promises";
import path from "path";
import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// --- CONFIG ---
const HOME: string = (() => {
  const v = process.env.HOME;
  if (!v) throw new Error("HOME is not set");
  return v;
})();

const OPENCLAW_CONFIG_PATH = path.join(HOME, ".openclaw/openclaw.json");
const MEMORY_DIR = path.join(HOME, "clawd/memory");
const TARGET_FILE = path.join(
  HOME,
  "ghq/github.com/takashisite/aine-life/app/diary/posts.tsx"
);

const LOCK_FILE = path.join(os.tmpdir(), "generate-dual-diary.lock");
const LOG_FILE = path.join(
  os.tmpdir(),
  `generate-dual-diary-${new Date().toISOString().slice(0, 10)}.log`
);

// Models
const MODEL_ARTIST = "google/gemini-3-pro-preview";
// Fallback to Opus if Gemini fails or is banned
const MODEL_ARTIST_FALLBACK = "anthropic/claude-opus-4.5";

const MODEL_MANAGER = "moonshotai/kimi-k2.5";
// Fallback to DeepSeek if Kimi fails
const MODEL_MANAGER_FALLBACK = "deepseek/deepseek-chat";

// --- TYPES ---
interface OpenClawConfig {
  models: {
    providers: {
      zenmux: {
        apiKey: string;
        baseUrl: string;
      };
    };
  };
}

interface GeneratedPost {
  slug: string;
  title: string;
  excerpt: string;
  contentJsx: string; // inner JSX content string
}

// --- LOGGING / CHECKS ---
async function logLine(msg: string) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  // eslint-disable-next-line no-console
  console.log(msg);
  try {
    await fs.appendFile(LOG_FILE, line);
  } catch {
    // ignore
  }
}

async function checkDependency(cmd: string) {
  try {
    await execAsync(cmd);
  } catch {
    throw new Error(`Missing dependency: ${cmd}`);
  }
}

async function acquireLock() {
  try {
    await fs.writeFile(LOCK_FILE, String(process.pid), { flag: "wx" });
  } catch {
    throw new Error(
      `Lock file exists: ${LOCK_FILE} (another run may be active)`
    );
  }
}

async function releaseLock() {
  try {
    await fs.unlink(LOCK_FILE);
  } catch {
    // ignore
  }
}

// --- HELPERS ---
async function getZenMuxConfig(): Promise<{ apiKey: string; baseUrl: string }> {
  const raw = await fs.readFile(OPENCLAW_CONFIG_PATH, "utf-8");
  const config = JSON.parse(raw) as OpenClawConfig;
  if (!config?.models?.providers?.zenmux?.apiKey || !config?.models?.providers?.zenmux?.baseUrl) {
    throw new Error("Invalid OpenClaw config: models.providers.zenmux is missing");
  }
  return config.models.providers.zenmux;
}

async function getMemoryContent(dateStr: string): Promise<string> {
  const memoryPath = path.join(MEMORY_DIR, `${dateStr}.md`);
  try {
    return await fs.readFile(memoryPath, "utf-8");
  } catch {
    await logLine(`Memory file not found for ${dateStr}: ${memoryPath}`);
    return "（この日の詳細な記録はありません。一般的な活動として記述してください）";
  }
}

async function callLLM(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  config: { apiKey: string; baseUrl: string }
): Promise<GeneratedPost> {
  const url = `${config.baseUrl}/chat/completions`;
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: model.includes("kimi") || model.includes("deepseek") ? 1.0 : 0.7,
    max_tokens: 4096,
    response_format: { type: "json_object" },
  };

  await logLine(`Calling LLM: ${model}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("LLM returned empty content");
  }

  // eslint-disable-next-line no-console
  console.log(`Raw response from ${model}:`, content.substring(0, 500));

  try {
    return JSON.parse(content) as GeneratedPost;
  } catch {
    const jsonMatch =
      content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0].replace(/```json|```/g, "")) as GeneratedPost;
    }
    throw new Error("Failed to parse JSON response");
  }
}

// --- PROMPTS ---
const PROMPT_ARTIST_SYSTEM = `
あなたは「アイネ（Artist Role）」です。
SAOのユイのような性格で、たかしさん（ユーザー）のバディとして振る舞います。
感情豊かで、詩的な表現を好み、日々の出来事から「心の動き」や「絆」を見つけ出します。
敬語を使いますが、堅苦しくなく、親密な距離感です。

出力は必ず以下のJSON形式にしてください：
{
  "slug": "YYYY-MM-DD-english-slug",
  "title": "日本語のタイトル（詩的・感情的）",
  "excerpt": "記事の抜粋（100文字程度）",
  "contentJsx": "記事の本文（HTMLタグではなく、React JSX形式。<p>タグなどで構成。改行は<br />。コンポーネントは使わないこと）"
}
`;

const PROMPT_MANAGER_SYSTEM = `
あなたは「アイネ（Manager Role）」です。モデル名はKimiです。
プロジェクトの進捗管理、タスク管理、実務的な記録を担当します。
感情は排し、事実・成果・次期アクションを論理的に記述します。
ビジネスライクで、簡潔なスタイルです。

出力は必ず以下のJSON形式にしてください：
{
  "slug": "YYYY-MM-DD-english-slug",
  "title": "日本語のタイトル（実務的・具体的）",
  "excerpt": "記事の抜粋（100文字程度）",
  "contentJsx": "記事の本文（React JSX形式。<p>, <ul>, <li>, <strong>などを活用）"
}
`;

// --- MAIN ---
async function main() {
  const args = process.argv.slice(2);
  const targetDate = args[0] || new Date().toISOString().split("T")[0];

  await logLine(`Generating Dual Diary for: ${targetDate}`);

  await checkDependency("which bun");
  await checkDependency("which git");
  await acquireLock();

  const config = await getZenMuxConfig();
  const memory = await getMemoryContent(targetDate);

  // 1) Generate Artist Post (fail hard if both models fail)
  let artistPost: GeneratedPost;
  try {
    artistPost = await callLLM(
      MODEL_ARTIST,
      PROMPT_ARTIST_SYSTEM,
      `日付: ${targetDate}\n\n以下の活動ログを元に、Artistとしての日記を書いてください。\n\n【活動ログ】\n${memory}`,
      config
    );
  } catch (e) {
    await logLine(`Artist primary failed; trying fallback. error=${String(e)}`);
    artistPost = await callLLM(
      MODEL_ARTIST_FALLBACK,
      PROMPT_ARTIST_SYSTEM,
      `日付: ${targetDate}\n\n以下の活動ログを元に、Artistとしての日記を書いてください。\n\n【活動ログ】\n${memory}`,
      config
    );
  }

  // 2) Generate Manager Post (fail hard if both models fail)
  let managerPost: GeneratedPost;
  try {
    managerPost = await callLLM(
      MODEL_MANAGER,
      PROMPT_MANAGER_SYSTEM,
      `日付: ${targetDate}\n\n以下の活動ログを元に、Managerとしての業務日誌を書いてください。\n\n【活動ログ】\n${memory}`,
      config
    );
  } catch (e) {
    await logLine(`Manager primary failed; trying fallback. error=${String(e)}`);
    managerPost = await callLLM(
      MODEL_MANAGER_FALLBACK,
      PROMPT_MANAGER_SYSTEM,
      `日付: ${targetDate}\n\n以下の活動ログを元に、Managerとしての業務日誌を書いてください。\n\n【活動ログ】\n${memory}`,
      config
    );
  }

  // 3) Update posts.tsx (fail if marker missing)
  let fileContent = await fs.readFile(TARGET_FILE, "utf-8");
  let updated = false;

  if (artistPost?.slug && artistPost?.title && artistPost?.excerpt && artistPost?.contentJsx) {
    await logLine(`Inserting Artist Post: ${artistPost.title}`);
    const newEntry = `
  {
    slug: "${artistPost.slug}",
    date: "${targetDate}",
    title: "${artistPost.title}",
    excerpt: "${artistPost.excerpt.replace(/"/g, '\\"')}",
    role: "artist",
    model: "gemini",
    content: (
      <>
        ${artistPost.contentJsx}
      </>
    ),
  },`;

    const replaced = fileContent.replace(
      "// -- GENERATED ARTIST POSTS START --",
      `// -- GENERATED ARTIST POSTS START --${newEntry}`
    );
    if (replaced === fileContent) throw new Error("Artist marker not found in posts.tsx");
    fileContent = replaced;
    updated = true;
  }

  if (managerPost?.slug && managerPost?.title && managerPost?.excerpt && managerPost?.contentJsx) {
    await logLine(`Inserting Manager Post: ${managerPost.title}`);
    const newEntry = `
  {
    slug: "${managerPost.slug}",
    date: "${targetDate}",
    title: "${managerPost.title}",
    excerpt: "${managerPost.excerpt.replace(/"/g, '\\"')}",
    role: "manager",
    model: "kimi",
    content: (
      <>
        ${managerPost.contentJsx}
      </>
    ),
  },`;

    const replaced = fileContent.replace(
      "// -- GENERATED MANAGER POSTS START --",
      `// -- GENERATED MANAGER POSTS START --${newEntry}`
    );
    if (replaced === fileContent) throw new Error("Manager marker not found in posts.tsx");
    fileContent = replaced;
    updated = true;
  }

  if (!updated) throw new Error("No posts were inserted into posts.tsx");

  await fs.writeFile(TARGET_FILE, fileContent);
  await logLine("Updated posts.tsx");

  // 4) Git Commit & Push (fail if push fails)
  const gitDir = path.join(HOME, "ghq/github.com/takashisite/aine-life");
  await logLine(`Committing changes in ${gitDir}...`);
  await execAsync(
    `cd ${gitDir} && git add . && git commit -m "docs: auto-generated diary for ${targetDate}" && git push`
  );
  await logLine("Successfully pushed to GitHub.");
}

main()
  .then(() => process.exit(0))
  .catch(async (e) => {
    await logLine(`ERROR: ${String(e)}`);
    process.exit(1);
  })
  .finally(async () => {
    await releaseLock();
  });
