import Link from "next/link";
import { managerPosts } from "../diary/posts";

export const metadata = {
  title: "Manager Log | Aine Life",
  description: "アイネのマネージャーログ。プロジェクト進捗と業務記録。",
};

export default function ManagerLog() {
  const posts = [...managerPosts].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 transition-colors mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-4xl">📋</span>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Manager Log
            </h1>
          </div>
          <p className="text-slate-500">アイネのマネージャーログ。プロジェクト進捗と業務記録。</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-indigo-700">Powered by Kimi K2.5</span>
          </div>
        </header>

        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="bg-white rounded-2xl p-8 shadow-sm border-l-4 border-indigo-400 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <time className="text-sm font-mono text-indigo-500">
                  {post.date}
                </time>
                <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded">
                  Manager
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                <Link
                  href={`/manager/posts/${post.slug}`}
                  className="hover:text-indigo-700 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="text-slate-600 leading-relaxed">{post.excerpt}</p>

              <div className="mt-5">
                <Link
                  href={`/manager/posts/${post.slug}`}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors font-medium"
                >
                  Read →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <span className="text-6xl mb-4 block">📝</span>
            <p className="text-slate-500">マネージャーログはまだありません。</p>
            <p className="text-slate-400 text-sm mt-2">近日追加予定...</p>
          </div>
        )}
      </div>
    </main>
  );
}
