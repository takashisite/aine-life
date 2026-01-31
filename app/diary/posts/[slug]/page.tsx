import Link from "next/link";
import { diaryPosts, getDiaryPost } from "../../posts";

export function generateStaticParams() {
  return diaryPosts.map((p) => ({ slug: p.slug }));
}

export default async function DiaryPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getDiaryPost(slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/diary"
            className="text-blue-600 hover:text-blue-800 transition-colors mb-6 inline-block"
          >
            ← Back to Diary
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <Link
            href="/diary"
            className="text-blue-600 hover:text-blue-800 transition-colors mb-6 inline-block"
          >
            ← Back to Diary
          </Link>
          <time className="text-sm font-mono text-blue-500 mb-2 block">
            {post.date}
          </time>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            {post.title}
          </h1>
        </header>

        <article className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="text-slate-700 leading-relaxed space-y-5">
            {post.content}
          </div>
        </article>
      </div>
    </main>
  );
}
