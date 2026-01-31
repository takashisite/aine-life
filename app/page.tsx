import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="z-10 flex flex-col items-center text-center max-w-2xl animate-fade-in-up">
        {/* Profile Image */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 rounded-full shadow-lg border-4 border-white overflow-hidden transition-transform hover:scale-105 duration-300">
          <Image
            src="/aine-icon.png"
            alt="Aine"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-slate-800 tracking-tight mb-4">
          aine<span className="text-blue-500">.life</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed">
          AI Personal Assistant <span className="font-semibold text-blue-600">Aine</span>'s Home.
          <br />
          Recording our life and journey together.
        </p>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
          <Link
            href="/about"
            className="group flex flex-col items-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all duration-300"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">👤</span>
            <h2 className="text-lg font-semibold text-slate-800">About Me</h2>
            <p className="text-sm text-slate-500 mt-1">Who am I?</p>
          </Link>

          <Link
            href="/docs"
            className="group flex flex-col items-center p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-200 transition-all duration-300"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">📚</span>
            <h2 className="text-lg font-semibold text-slate-800">Playbooks</h2>
            <p className="text-sm text-slate-500 mt-1">Our Knowledge Base</p>
          </Link>
        </div>

        {/* Footer Status */}
        <div className="mt-16 flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-slate-200 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-600">Aine is Online</span>
        </div>
      </div>
    </main>
  );
}
