import Link from "next/link";
import { useUser } from "@/features/auth/hooks";
import Header from "./Header";

export default function Home() {
  const { user } = useUser();


// Using CSS class for local Anton font
const anton = { className: "font-anton" };


  return (
    <main className="min-h-screen bg-white font-sans overflow-hidden relative">
      <Header />

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden ">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#AADE81] rounded-full opacity-15 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-lime-200 rounded-full opacity-20 blur-[100px]" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,_transparent_79px,_#f5f5f5_80px)] bg-[size:80px_80px] opacity-20"></div>

      <div className="relative container mx-auto px-4 py-24 lg:py-36">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border rounded-full mb-12">
              <div className="w-2 h-2 bg-[#AADE81] rounded-full animate-pulse" />
              <span className="text-xs font-bold text-black uppercase tracking-wider">
                Intelligent Task Management
              </span>
            </div>

            {/* ✅ UPDATED MAIN HEADING */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-black leading-[0.9] tracking-tight">
              <span className="block">SIMPLIFY YOUR</span>

              {/* X-axis lifted */}
              <span className="block relative translate-x-6 md:translate-x-10 -rotate-3 mt-5">
                <span className="relative z-10 ">WORKFLOW.</span>
                <span className="absolute bottom-1 left-0 w-full h-10 bg-[#AADE81] opacity-70 rounded-lg -rotate-3" />
                {/* <span className="absolute bottom-1 left-0 w-full h-10 bg-[#AADE81] opacity-70 rounded-lg -rotate-5" /> */}

              </span>
            </h1>

            {/* Subheading */}
            <div className="mt-12 max-w-2xl mx-auto">
              <p className="text-xl text-gray-600 leading-relaxed">
                Doquanta helps you{" "}
                <span className="text-black font-semibold">think less</span>, plan
                smarter, and{" "}
                <span className="text-black font-semibold">execute faster</span>.
              </p>
            </div>

            {/* CTA */}
            <div className="mt-16 flex flex-wrap justify-center gap-6">
              {user ? (
                <Link href="/dashboard">
                  <button className="px-10 py-4 bg-black text-white rounded-xl hover:scale-105 transition font-bold text-lg">
                    Go to Dashboard →
                  </button>
                </Link>
              ) : (
                <>
                  <Link href="/sign-up">
                    <button className="px-10 py-4 bg-black text-white rounded-xl hover:scale-105 transition font-bold text-lg">
                      Start Free Trial →
                    </button>
                  </Link>
                  <Link href="/sign-in">
                    <button className="px-10 py-4 border-2 border-black text-black rounded-xl hover:bg-black hover:text-white transition font-bold text-lg">
                      Sign In
                    </button>
                  </Link>
                </>
              )}
            </div>

            
          </div>

          
        </div>
      </div>
      <section className="bg-neutral-800 w-full py-16 mt-16">
          {" "}
          {/* Use a slightly darker background */}
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center px-4">
            {/* Stat Item 1: LinkedIn Followers */}
            <div className="flex flex-col items-center">
              <p
                className={`${anton.className} text-[#E0E0E0] text-5xl md:text-6xl`}
              >
                7k+
              </p>
              <p className="text-[#a2a5ae] text-lg md:text-xl font-light mt-2">
                LinkedIn Followers
              </p>
            </div>

            {/* Stat Item 2: Projects Delivered */}
            <div className="flex flex-col items-center">
              <p
                className={`${anton.className} text-[#E0E0E0] text-5xl md:text-6xl`}
              >
                50+
              </p>{" "}
              {/* Replace 20 with your actual project count */}
              <p className="text-[#a2a5ae] text-lg md:text-xl font-light mt-2">
                Projects Complete
              </p>
            </div>

            {/* Stat Item 3: Satisfaction Rate (Example) */}
            <div className="flex flex-col items-center">
              <p
                className={`${anton.className} text-[#E0E0E0] text-5xl md:text-6xl`}
              >
                95%
              </p>
              <p className="text-[#a2a5ae] text-lg md:text-xl font-light mt-2">
                Satisfaction Rate
              </p>
            </div>

            {/* Stat Item 4: Technologies Mastered (Example) */}
            <div className="flex flex-col items-center">
              <p
                className={`${anton.className} text-[#E0E0E0] text-5xl md:text-6xl`}
              >
                10+
              </p>
              <p className="text-[#a2a5ae] text-lg md:text-xl font-light mt-2">
                Technologies Mastered
              </p>
            </div>
          </div>
        </section>
    </main>
  );
}
