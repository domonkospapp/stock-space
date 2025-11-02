"use client";

import {
  ArrowUpRightIcon,
  EyeIcon,
  LightningIcon,
  LockIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState, useRef } from "react";

export default function Home() {
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handlePlayButtonHover = (stepNumber: number) => {
    setHoveredVideo(stepNumber);
    const video = videoRefs.current[stepNumber - 1];
    if (video) {
      video.currentTime = 0;
      video.play();
    }
  };

  const handlePlayButtonLeave = () => {
    setHoveredVideo(null);
    videoRefs.current.forEach((video) => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  return (
    <div
      className="min-h-screen bg-ci-black text-white"
      onMouseMove={handleMouseMove}
    >
      {/* Header Navigation */}

      {/* Floating Video Player */}
      {hoveredVideo && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: mousePosition.x - 580,
            top: mousePosition.y - 450,
          }}
        >
          <video
            ref={(el) => {
              videoRefs.current[hoveredVideo - 1] = el;
            }}
            className="w-[640px] h-[384px] rounded-lg shadow-2xl"
            autoPlay
            muted
            loop
            onEnded={() => setHoveredVideo(null)}
          >
            <source src="/videos/how-to.mov" type="video/quicktime" />
            <source src="/videos/how-to.mov" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Hero Section */}
      <section
        id="hero"
        className="min-h-screen max-w-7xl mx-auto flex flex-col"
      >
        <Header />
        {/* NEW SHIT */}
        <h1 className="text-8xl font-[hagrid] leading-tight font-bold">
          SEE WHAT FLATEX
        </h1>

        <div className="grid grid-cols-6">
          <div className="col-span-2 h-full relative">
            <video
              className="w-full h-full object-cover rounded-full"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/videos/hero.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="col-span-4 h-full pl-8 flex flex-col justify-between pb-12">
            <h1 className="text-8xl font-[hagrid] leading-tight font-bold">
              WON'T SHOW.
            </h1>
            <div className="flex flex-col gap-6">
              <p className="text-3xl font-[urbanist] text-gray-300">
                Drop your flatex export and get clear! Interactive insights on
                your allocation, returns, and trends. Instantly, privately, and
                effortlessly.
              </p>
              <div className="flex flex-row items-center space-x-4">
                <Link
                  href="/fileUpload"
                  className="bg-ci-yellow hover:bg-ci-yellow/80 text-background text-2xl font-bold font-[urbanist] px-6 py-2 rounded-full transition-colors flex items-center space-x-2 h-16"
                >
                  <span className="text-background">Upload Flatex CSV</span>
                  <ArrowUpRightIcon
                    className="w-8 h-8 text-background"
                    weight="bold"
                  />
                </Link>
                <button className="border border-white text-white px-6 py-2 cursor-pointer rounded-full font-[urbanist] hover:bg-white hover:text-background text-xl font-bold transition-colors h-16">
                  Try Demo Portfolio
                </button>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 w-full">
              <div className="flex justify-between w-full">
                {/* Clear Insights */}
                <div className="bg-[#404040] px-12 py-6 rounded-2xl text-center">
                  <div className="flex justify-center mb-4">
                    <EyeIcon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-white font-[hagrid] text-lg uppercase">
                    CLEAR INSIGHTS
                  </h3>
                </div>

                {/* Full Privacy */}
                <div className="bg-[#404040] px-12 py-6 rounded-2xl text-center">
                  <div className="flex justify-center mb-4">
                    <LockIcon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-white font-[hagrid] text-lg uppercase">
                    FULL PRIVACY
                  </h3>
                </div>

                {/* Instant Access */}
                <div className="bg-[#404040] px-12 py-6 rounded-2xl text-center">
                  <div className="flex justify-center mb-4">
                    <LightningIcon className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-white font-[hagrid] text-lg uppercase">
                    INSTANT ACCESS
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features / Benefits Section */}
      <section id="about" className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-7xl font-bold font-[hagrid] mb-6 leading-tight">
            Everything your Flatex account{" "}
            <span className="text-ci-yellow underline">should </span> show
          </h2>
          <p className="text-2xl font-[urbanist] text-gray-300 mb-16 max-w-4xl">
            stck.space turns your Flatex export into clear, interactive
            insights. No clutter. No spreadsheets. Just your portfolio, fully
            visualized — instantly and privately.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Feature 1: Portfolio Overview */}
            <FeatureCard
              title="See your portfolio at a glance"
              description="Instantly visualize how your portfolio is distributed across your holdings. A clean pie chart shows the percentage of each asset — simple, clear, and easy to understand."
              image="/why/1.png"
            />

            {/* Feature 2: Performance & Returns */}
            <FeatureCard
              title="Track your growth over time"
              description="See how your portfolio performed over weeks, months, or the year. Quickly check your total returns and trends without manually calculating or reading complicated tables."
              image="/why/2.png"
            />

            {/* Feature 3: Monthly Activity */}
            <FeatureCard
              title="Know your buying patterns"
              description="Understand when you bought the most and get a quick overview of your transactions over time. Simple charts help you spot trends and patterns in your investing activity."
              image="/why/3.png"
            />

            {/* Feature 4: Instant & Private */}
            <FeatureCard
              title="Insights in seconds, 100% on your device"
              description="No cloud. No registration. Your data stays on your device at all times. Upload your flatex export and explore instantly, safely, and privately."
              image="/why/4.png"
            />
          </div>
        </div>
      </section>

      {/* End CTA Section */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-6xl font-bold font-[hagrid] mb-12">
            Transform your Flatex data into insights.
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row items-center gap-4">
              <Link
                href="/fileUpload"
                className="bg-foreground hover:bg-ci-yellow text-background text-xl font-bold font-[urbanist] px-6 py-2 rounded-full transition-colors inline-flex items-center space-x-2 h-16"
              >
                <span>Upload CSV Now</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 53 53"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_67_2009)">
                    <path
                      d="M13.8913 14.9227C15.134 16.1654 18.2077 16.811 20.9968 17.1456C24.588 17.5759 28.2308 17.4464 31.7363 16.6234C34.3619 16.0064 37.2948 15.0014 38.8763 13.4199M37.4026 38.434C36.1599 37.1912 35.5142 34.1176 35.1797 31.3285C34.7494 27.7373 34.8789 24.0945 35.7019 20.5889C36.3189 17.9634 37.3239 15.0305 38.9054 13.449M38.8909 13.4344L-69.4685 121.794"
                      stroke="#292929"
                      strokeWidth="3"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_67_2009">
                      <rect
                        width="36"
                        height="38"
                        fill="white"
                        transform="translate(0 25.4551) rotate(-45)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </Link>
              <button className="border border-foreground text-foreground px-6 py-2 cursor-pointer rounded-full font-[urbanist] hover:bg-foreground hover:text-background text-xl font-bold transition-colors h-16">
                Try Demo Portfolio
              </button>
            </div>
            <p className="mt-2 text-gray-400 font-[urbanist] text-lg">
              100% private & instant — all processing happens in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Three Steps Section */}
      <section id="steps" className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-7xl font-bold font-[hagrid] mb-12">
            Three simple steps to get started{" "}
            <span className="text-ci-purple">:</span>
          </h2>
          <div className="space-y-6">
            <StepExplanation
              rowIndex={1}
              title="Export CSV from Flatex"
              description="Export your data from Flatex in CSV format"
              onMouseEnter={() => handlePlayButtonHover(1)}
              onMouseLeave={handlePlayButtonLeave}
            />
            <StepExplanation
              rowIndex={2}
              title="Import CSV to StockSpace"
              description="Import your data into StockSpace in CSV format"
              onMouseEnter={() => handlePlayButtonHover(2)}
              onMouseLeave={handlePlayButtonLeave}
            />
            <StepExplanation
              rowIndex={3}
              title="Analyze your data"
              description="Analyze your data using StockSpace's powerful tools"
              onMouseEnter={() => handlePlayButtonHover(3)}
              onMouseLeave={handlePlayButtonLeave}
            />
          </div>
        </div>
      </section>

      {/* Upload CTA Section */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-6xl font-bold font-[hagrid] mb-12">
            Transform your Flatex data into insights.
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row items-center gap-4">
              <Link
                href="/fileUpload"
                className="bg-foreground hover:bg-ci-yellow text-background text-xl font-bold font-[urbanist] px-6 py-2 rounded-full transition-colors inline-flex items-center space-x-2 h-16"
              >
                <span>Upload CSV Now</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 53 53"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_67_2009)">
                    <path
                      d="M13.8913 14.9227C15.134 16.1654 18.2077 16.811 20.9968 17.1456C24.588 17.5759 28.2308 17.4464 31.7363 16.6234C34.3619 16.0064 37.2948 15.0014 38.8763 13.4199M37.4026 38.434C36.1599 37.1912 35.5142 34.1176 35.1797 31.3285C34.7494 27.7373 34.8789 24.0945 35.7019 20.5889C36.3189 17.9634 37.3239 15.0305 38.9054 13.449M38.8909 13.4344L-69.4685 121.794"
                      stroke="#292929"
                      strokeWidth="3"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_67_2009">
                      <rect
                        width="36"
                        height="38"
                        fill="white"
                        transform="translate(0 25.4551) rotate(-45)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </Link>
              <button className="border border-foreground text-foreground px-6 py-2 cursor-pointer rounded-full font-[urbanist] hover:bg-foreground hover:text-background text-xl font-bold transition-colors h-16">
                Try Demo Portfolio
              </button>
            </div>
            <p className="mt-2 text-gray-400 font-[urbanist] text-lg">
              100% private & instant — all processing happens in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="px-8 py-16 bg-ci-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold font-[hagrid] mb-4">
              Trusted by investors who value their privacy
            </h2>
            <p className="text-xl font-[urbanist] text-gray-300">
              Join thousands of users who&apos;ve discovered the power of clear
              portfolio insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-ci-purple p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="flex text-ci-yellow">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-background font-[urbanist] text-lg mb-4 leading-relaxed">
                &quot;Finally! I can see my portfolio allocation clearly.
                Flatex&apos;s interface was so cluttered, but this gives me
                exactly what I need in seconds.&quot;
              </p>
              <div className="text-background/80 font-[urbanist]">
                <div className="font-bold">Sarah M.</div>
                <div className="text-sm">Long-term investor</div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-ci-purple p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="flex text-ci-yellow">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-background font-[urbanist] text-lg mb-4 leading-relaxed">
                &quot;Love that my data never leaves my computer. The
                privacy-first approach gives me peace of mind while getting the
                insights I need.&quot;
              </p>
              <div className="text-background/80 font-[urbanist]">
                <div className="font-bold">Michael K.</div>
                <div className="text-sm">Privacy-conscious trader</div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-ci-purple p-6 rounded-2xl">
              <div className="flex items-center mb-4">
                <div className="flex text-ci-yellow">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-background font-[urbanist] text-lg mb-4 leading-relaxed">
                &quot;Simple, fast, and exactly what I was looking for. No
                complicated setup, just upload and explore. Perfect for my
                investment tracking.&quot;
              </p>
              <div className="text-background/80 font-[urbanist]">
                <div className="font-bold">Anna L.</div>
                <div className="text-sm">Portfolio manager</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold font-[hagrid] text-ci-yellow mb-2">
                10K+
              </div>
              <div className="text-xl font-[urbanist] text-gray-300">
                Portfolios analyzed
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold font-[hagrid] text-ci-yellow mb-2">
                100%
              </div>
              <div className="text-xl font-[urbanist] text-gray-300">
                Privacy guaranteed
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold font-[hagrid] text-ci-yellow mb-2">
                &lt;30s
              </div>
              <div className="text-xl font-[urbanist] text-gray-300">
                Average upload time
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-6xl font-bold font-[hagrid] mb-12">
            Ready to see your portfolio the way it should be?
          </h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row items-center gap-4">
              <Link
                href="/fileUpload"
                className="bg-foreground hover:bg-ci-yellow text-background text-xl font-bold font-[urbanist] px-6 py-2 rounded-full transition-colors inline-flex items-center space-x-2 h-16"
              >
                <span>Upload CSV Now</span>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 53 53"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_67_2009)">
                    <path
                      d="M13.8913 14.9227C15.134 16.1654 18.2077 16.811 20.9968 17.1456C24.588 17.5759 28.2308 17.4464 31.7363 16.6234C34.3619 16.0064 37.2948 15.0014 38.8763 13.4199M37.4026 38.434C36.1599 37.1912 35.5142 34.1176 35.1797 31.3285C34.7494 27.7373 34.8789 24.0945 35.7019 20.5889C36.3189 17.9634 37.3239 15.0305 38.9054 13.449M38.8909 13.4344L-69.4685 121.794"
                      stroke="#292929"
                      strokeWidth="3"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_67_2009">
                      <rect
                        width="36"
                        height="38"
                        fill="white"
                        transform="translate(0 25.4551) rotate(-45)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </Link>
              <button className="border border-foreground text-foreground px-6 py-2 cursor-pointer rounded-full font-[urbanist] hover:bg-foreground hover:text-background text-xl font-bold transition-colors h-16">
                Try Demo Portfolio
              </button>
            </div>
            <p className="mt-2 text-gray-400 font-[urbanist] text-lg">
              100% private & instant — all processing happens in your browser.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="px-8 pt-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-ci-yellow rounded-b-[4rem] p-48 relative">
            <div className="absolute top-20 left-8 w-12 h-12 border-l-4 border-t-4 border-background"></div>
            <div className="absolute top-20 right-8 w-12 h-12 border-r-4 border-t-4 border-background"></div>
            <div className="absolute bottom-20 left-8 w-12 h-12 border-l-4 border-b-4 border-background"></div>
            <div className="absolute bottom-20 right-8 w-12 h-12 border-r-4 border-b-4 border-background"></div>
            <div className="flex items-center justify-center">
              <h1 className="text-8xl font-bold font-[hagrid] text-background">
                STCK.SPACE
              </h1>
            </div>
          </div>
        </div>

        {/* Minimal Footer Text */}
        <div className="max-w-7xl mx-auto px-8 py-8 text-center">
          <p className="text-sm font-[urbanist] text-gray-400">
            Stock Space is not affiliated with Flatex. Your data never leaves
            your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}

const StepExplanation = ({
  onMouseEnter,
  onMouseLeave,
  rowIndex,
  title,
  description,
}: {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  rowIndex: number;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-center justify-between py-4 border-b border-foreground">
      <div className="flex items-center space-x-6">
        <span className="text-7xl font-bold font-[hagrid]">0{rowIndex}</span>
        <div>
          <h3 className="text-2xl font-urbanist mb-1">{title}</h3>
          <p className="text-gray-400 font-urbanist">{description}</p>
        </div>
      </div>
      <button
        className="w-20 h-20 border-foreground border rounded-full flex items-center justify-center hover:bg-gray-200 group transition-colors cursor-pointer"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <svg
          className="w-8 h-8 text-foreground ml-0.5 group-hover:text-background"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      </button>
    </div>
  );
};

const Advantage = ({
  title,
  text,
  color,
}: {
  title: string;
  text: string;
  color: string;
}) => {
  return (
    <div className={`p-6 rounded-4xl relative ${color}`}>
      <div className="absolute top-4 right-4 w-8 h-8 bg-background rounded-full flex items-center justify-center">
        <svg
          className="w-4 h-4 text-foreground"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h3 className="text-3xl font-bold font-urbanist mb-4 text-background">
        {title}
      </h3>

      <p className="font-urbanist text-background text-lg mb-2">{text}</p>
    </div>
  );
};

const Header = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="flex justify-between items-center py-8 w-full">
      <nav className="flex space-x-2">
        <button
          className="font-urbanist text-xl text-white px-6 py-2 border border-white rounded-full hover:bg-white hover:text-background transition-all cursor-pointer"
          onClick={() => scrollToSection("hero")}
        >
          home
        </button>
        <button
          className="font-urbanist text-xl text-white px-6 py-2 border border-white rounded-full hover:bg-white hover:text-background transition-all cursor-pointer"
          onClick={() => scrollToSection("about")}
        >
          features
        </button>
        <button
          className="font-urbanist text-xl text-white px-6 py-2 border border-white rounded-full hover:bg-white hover:text-background transition-all cursor-pointer"
          onClick={() => scrollToSection("steps")}
        >
          how it works
        </button>
      </nav>
      {/*<Link
        href="/login"
        className="font-[hagrid] text-lg hover:text-gray-300"
      >
        login
      </Link>*/}
    </header>
  );
};

const FeatureCard = ({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) => {
  return (
    <div className="border border-foreground bg-foreground/10 p-8 rounded-3xl h-full space-y-4">
      <h3 className="text-3xl font-[hagrid] text-foreground">{title}</h3>
      <p className="text-xl font-[urbanist] text-foreground leading-relaxed">
        {description}
      </p>
      <img
        src={image}
        alt={title}
        className="w-full h-auto rounded-2xl shadow-lg mx-auto"
      />
    </div>
  );
};
