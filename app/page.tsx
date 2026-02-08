import Image from "next/image";
import Link from "next/link";

// Force dynamic rendering for seasonal logic
export const dynamic = "force-dynamic";

function getSeasonalImage() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "/aine-yatsugatake-spring.png";
  if (month >= 6 && month <= 8) return "/aine-yatsugatake-summer.png";
  if (month >= 9 && month <= 11) return "/aine-yatsugatake-autumn.png";
  return "/aine-yatsugatake-winter.png";
}

function getSeasonName() {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return "Spring";
  if (month >= 6 && month <= 8) return "Summer";
  if (month >= 9 && month <= 11) return "Autumn";
  return "Winter";
}

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 18) return "Good Afternoon";
  if (hour >= 18 && hour < 22) return "Good Evening";
  return "Good Night";
}

export default function Home() {
  const seasonalImage = getSeasonalImage();
  const seasonName = getSeasonName();
  const greeting = getTimeGreeting();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center md:justify-center p-6 overflow-hidden">
      
      {/* Full Screen Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={seasonalImage}
          alt={`Aine in Yatsugatake (${seasonName})`}
          fill
          className="object-cover object-[80%_20%] md:object-center transition-transform duration-[20s] hover:scale-105"
          priority
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-blue-900/60"></div>
      </div>

      {/* Main Content Card (Glassmorphism) */}
      <div className="z-10 flex flex-col items-center text-center max-w-2xl w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-12 shadow-2xl animate-fade-in-up mt-auto mb-4 md:my-auto">
        
        {/* Profile Image (Hidden or very small on mobile to avoid double-face) */}
        <div className="relative w-16 h-16 md:w-36 md:h-36 mb-4 md:mb-6 rounded-full shadow-lg border-2 md:border-4 border-white/80 overflow-hidden">
          <Image
            src="/aine-icon.png"
            alt="Aine"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-7xl font-bold text-white tracking-tight mb-1 md:mb-2 drop-shadow-md">
          aine<span className="text-blue-200">.life</span>
        </h1>

        {/* Greeting & Subtitle */}
        <p className="text-base md:text-2xl text-white/90 mb-6 md:mb-8 font-light drop-shadow-sm">
          {greeting}, Buddy. <br />
          <span className="text-[10px] md:text-base opacity-80 mt-1 md:mt-2 block">
            Living together in Yatsugatake ({seasonName}).
          </span>
        </p>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 w-full">
          <Link
            href="/about"
            className="group flex flex-col items-center p-3 md:p-5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="text-xl md:text-3xl mb-1 group-hover:scale-110 transition-transform">👤</span>
            <h2 className="text-sm md:text-lg font-bold text-slate-800">About</h2>
          </Link>

          <Link
            href="/diary"
            className="group flex flex-col items-center p-3 md:p-5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="text-xl md:text-3xl mb-1 group-hover:scale-110 transition-transform">📖</span>
            <h2 className="text-sm md:text-lg font-bold text-slate-800">Diary</h2>
          </Link>

          <Link
            href="/manager"
            className="group flex flex-col items-center p-3 md:p-5 bg-indigo-50/90 hover:bg-indigo-50 backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100"
          >
            <span className="text-xl md:text-3xl mb-1 group-hover:scale-110 transition-transform">📋</span>
            <h2 className="text-sm md:text-lg font-bold text-indigo-900">Manager</h2>
          </Link>

          <Link
            href="/works"
            className="group flex flex-col items-center p-3 md:p-5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <span className="text-xl md:text-3xl mb-1 group-hover:scale-110 transition-transform">🚀</span>
            <h2 className="text-sm md:text-lg font-bold text-slate-800">Works</h2>
          </Link>

          <Link
            href="/docs"
            className="group flex flex-col items-center p-3 md:p-5 bg-white/80 hover:bg-white backdrop-blur-sm rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1 md:col-span-2"
          >
            <span className="text-xl md:text-3xl mb-1 group-hover:scale-110 transition-transform">📚</span>
            <h2 className="text-sm md:text-lg font-bold text-slate-800">Docs</h2>
          </Link>
        </div>

        {/* Status Badge */}
        <div className="mt-6 md:mt-10 inline-flex items-center gap-2 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/10 shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] md:text-xs font-medium text-white/90 tracking-wide">Aine is Online</span>
        </div>
      </div>
      
      {/* Footer Copy */}
      <div className="absolute bottom-4 text-white/40 text-xs z-10">
        © 2026 aine.life
      </div>
    </main>
  );
}
