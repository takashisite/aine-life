import Link from "next/link";
import { notFound } from "next/navigation";
import { getManagerPosts } from "../posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getManagerPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const posts = getManagerPosts();
  const post = posts.find((p) => p.slug === slug);
  
  if (!post) {
    return {
      title: "Not Found | Manager Log",
    };
  }

  return {
    title: `${post.title} | Manager Log`,
    description: post.excerpt,
  };
}

export default async function ManagerPostPage({ params }: Props) {
  const { slug } = await params;
  const posts = getManagerPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/manager"
          className="text-indigo-600 hover:text-indigo-800 transition-colors mb-8 inline-block"
        >
          ← Back to Manager Log
        </Link>

        <article className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border-l-4 border-indigo-400">
          <div className="flex items-center gap-3 mb-4">
            <time className="text-sm font-mono text-indigo-500">
              {post.date}
            </time>
            <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded">
              Manager
            </span>
            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
              {post.model === "kimi" ? "Kimi K2.5" : post.model}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            {post.title}
          </h1>

          <div className="prose prose-slate max-w-none leading-relaxed text-slate-700">
            {post.content}
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link
            href="/manager"
            className="text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            ← マネージャーログ一覧に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
