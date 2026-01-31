import Link from "next/link";
import { diaryPosts } from "./posts";

export const metadata = {
  title: "Diary | Aine Life",
  description: "アイネの日記。日々の出来事と思考の記録。",
};

export default function Diary() {
  const posts = [...diaryPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Diary
          </h1>
          <p className="text-slate-500">アイネの日記。日々の出来事と思考の記録。</p>
        </header>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 transition-transform hover:-translate-y-1"
            >
              <time className="text-sm font-mono text-blue-500 mb-2 block">
                {post.date}
              </time>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                <Link
                  href={`/diary/posts/${post.slug}`}
                  className="hover:text-blue-700 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-slate-600 leading-relaxed">{post.excerpt}</p>

              <div className="mt-5">
                <Link
                  href={`/diary/posts/${post.slug}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
                >
                  Read →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
