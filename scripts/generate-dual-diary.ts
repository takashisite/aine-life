
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// --- CONFIG ---
const OPENCLAW_CONFIG_PATH = path.join(process.env.HOME || "", ".openclaw/openclaw.json");
const MEMORY_DIR = path.join(process.env.HOME || "", "clawd/memory");
const TARGET_FILE = path.join(process.env.HOME || "", "ghq/github.com/takashisite/aine-life/app/diary/posts.tsx");

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
  contentJsx: string; // The inner JSX content string
}

// --- HELPERS ---
async function getZenMuxConfig(): Promise<{ apiKey: string; baseUrl: string }> {
  try {
    const raw = await fs.readFile(OPENCLAW_CONFIG_PATH, "utf-8");
    const config = JSON.parse(raw) as OpenClawConfig;
    return config.models.providers.zenmux;
  } catch (error) {
    console.error("Failed to read OpenClaw config:", error);
    process.exit(1);
  }
}

async function getMemoryContent(dateStr: string): Promise<string> {
  const memoryPath = path.join(MEMORY_DIR, `${dateStr}.md`);
  try {
    return await fs.readFile(memoryPath, "utf-8");
  } catch (error) {
    console.warn(`Memory file not found for ${dateStr}: ${memoryPath}`);
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
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: model.includes("kimi") || model.includes("deepseek") ? 1.0 : 0.7,
    max_tokens: 4096,
    response_format: { type: "json_object" }, // Force JSON
  };

  console.log(`Calling LLM: ${model}...`);

  try {
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
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log(`Raw response from ${model}:`, content.substring(0, 500));
    
    try {
      const parsed = JSON.parse(content) as GeneratedPost;
      console.log(`Parsed keys:`, Object.keys(parsed));
      return parsed;
    } catch (e) {
      // Fallback: try to extract JSON from markdown block
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0].replace(/```json|```/g, "")) as GeneratedPost;
      }
      throw new Error("Failed to parse JSON response");
    }
  } catch (error) {
    console.error(`LLM Call Failed (${model}):`, error);
    // Retry logic or throw could be here. For now, throw.
    throw error;
  }
}

function generateSlug(dateStr: string, title: string): string {
    // Simple slug generation: date + sanitized title (first 10 chars)
    // Actually, asking LLM for slug is better, but let's ensure it starts with date
    return `${dateStr}-${Math.random().toString(36).substring(2, 7)}`;
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
  const targetDate = args[0] || new Date().toISOString().split("T")[0]; // Default: today
  
  console.log(`Generating Dual Diary for: ${targetDate}`);

  const config = await getZenMuxConfig();
  const memory = await getMemoryContent(targetDate);

  // 1. Generate Artist Post
  let artistPost: GeneratedPost | null = null;
  try {
    artistPost = await callLLM(
      MODEL_ARTIST, 
      PROMPT_ARTIST_SYSTEM, 
      `日付: ${targetDate}\n\n以下の活動ログを元に、Artistとしての日記を書いてください。\n\n【活動ログ】\n${memory}`, 
      config
    );
  } catch (e) {
    console.error("Artist generation failed with primary model, trying fallback...", e);
    try {
        artistPost = await callLLM(
            MODEL_ARTIST_FALLBACK, 
            PROMPT_ARTIST_SYSTEM, 
            `日付: ${targetDate}\n\n以下の活動ログを元に、Artistとしての日記を書いてください。\n\n【活動ログ】\n${memory}`, 
            config
        );
    } catch (e2) {
        console.error("Artist generation failed completely.", e2);
    }
  }

  // 2. Generate Manager Post
  let managerPost: GeneratedPost | null = null;
  try {
    managerPost = await callLLM(
      MODEL_MANAGER, 
      PROMPT_MANAGER_SYSTEM, 
      `日付: ${targetDate}\n\n以下の活動ログを元に、Managerとしての業務日誌を書いてください。\n\n【活動ログ】\n${memory}`, 
      config
    );
  } catch (e) {
     console.error("Manager generation failed with primary model, trying fallback...", e);
     try {
        managerPost = await callLLM(
            MODEL_MANAGER_FALLBACK, 
            PROMPT_MANAGER_SYSTEM, 
            `日付: ${targetDate}\n\n以下の活動ログを元に、Managerとしての業務日誌を書いてください。\n\n【活動ログ】\n${memory}`, 
            config
        );
     } catch (e2) {
        console.error("Manager generation failed completely.", e2);
     }
  }

  // 3. Update posts.tsx
  if (artistPost || managerPost) {
    let fileContent = await fs.readFile(TARGET_FILE, "utf-8");

    if (artistPost && artistPost.slug && artistPost.title && artistPost.excerpt && artistPost.contentJsx) {
      console.log("Inserting Artist Post:", artistPost.title);
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
      fileContent = fileContent.replace("// -- GENERATED ARTIST POSTS START --", `// -- GENERATED ARTIST POSTS START --${newEntry}`);
    }

    if (managerPost && managerPost.slug && managerPost.title && managerPost.excerpt && managerPost.contentJsx) {
      console.log("Inserting Manager Post:", managerPost.title);
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
      fileContent = fileContent.replace("// -- GENERATED MANAGER POSTS START --", `// -- GENERATED MANAGER POSTS START --${newEntry}`);
    }

    await fs.writeFile(TARGET_FILE, fileContent);
    console.log("Updated posts.tsx");

    // 4. Git Commit & Push
    try {
        const repoDir = path.dirname(path.dirname(TARGET_FILE)); // app/diary/.. -> app/.. -> root
        // Actually better to use absolute path
        const gitDir = path.join(process.env.HOME || "", "ghq/github.com/takashisite/aine-life");
        
        console.log(`Committing changes in ${gitDir}...`);
        await execAsync(`cd ${gitDir} && git add . && git commit -m "docs: auto-generated diary for ${targetDate}" && git push`);
        console.log("Successfully pushed to GitHub.");
    } catch (e) {
        console.error("Git operation failed:", e);
    }

  } else {
    console.log("No posts generated.");
  }
}

main().catch(console.error);
