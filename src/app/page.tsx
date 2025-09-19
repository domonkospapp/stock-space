"use client";

import Link from "next/link";
import { useState, useRef } from "react";

export default function Home() {
  const [activeNav, setActiveNav] = useState("home");
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
      className="min-h-screen bg-gray-900 text-white"
      onMouseMove={handleMouseMove}
    >
      {/* Header Navigation */}
      <header className="flex justify-between items-center p-8">
        <nav className="flex space-x-8">
          <Link
            href="/"
            className={`font-[hagrid] text-lg transition-all ${
              activeNav === "home"
                ? "border border-white rounded-full px-4 py-2"
                : "hover:text-gray-300"
            }`}
            onClick={() => setActiveNav("home")}
          >
            home
          </Link>
          <Link
            href="/about"
            className="font-[hagrid] text-lg hover:text-gray-300"
            onClick={() => setActiveNav("about")}
          >
            about
          </Link>
          <Link
            href="/demo"
            className="font-[hagrid] text-lg hover:text-gray-300"
            onClick={() => setActiveNav("demo")}
          >
            demo
          </Link>
        </nav>
        <Link
          href="/login"
          className="font-[hagrid] text-lg hover:text-gray-300"
        >
          login
        </Link>
      </header>

      {/* Floating Video Player */}
      {hoveredVideo && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: mousePosition.x - 340,
            top: mousePosition.y - 100,
          }}
        >
          <div className="bg-black rounded-lg p-4 shadow-2xl">
            <video
              ref={(el) => (videoRefs.current[hoveredVideo - 1] = el)}
              className="w-80 h-48 rounded"
              muted
              loop
              onEnded={() => setHoveredVideo(null)}
            >
              <source
                src={`/videos/step-${hoveredVideo}.mp4`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
            <p className="text-white text-sm mt-2 font-[hagrid]">
              Step {hoveredVideo} Tutorial
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="px-8 pb-16">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-8xl font-bold font-[hagrid] mb-6 leading-tight">
              Launch your portfolio
            </h1>
            <p className="text-xl font-[hagrid] mb-8 text-gray-300">
              Upload your Flatex CSV and see your portfolio like never before.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/fileUpload"
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-[hagrid] transition-colors flex items-center space-x-2"
              >
                <span>Upload Your Flatex CSV</span>
                <svg
                  width="53"
                  height="53"
                  viewBox="0 0 53 53"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_67_2009)">
                    <path
                      d="M13.8913 14.9227C15.134 16.1654 18.2077 16.811 20.9968 17.1456C24.588 17.5759 28.2308 17.4464 31.7363 16.6234C34.3619 16.0064 37.2948 15.0014 38.8763 13.4199M37.4026 38.434C36.1599 37.1912 35.5142 34.1176 35.1797 31.3285C34.7494 27.7373 34.8789 24.0945 35.7019 20.5889C36.3189 17.9634 37.3239 15.0305 38.9054 13.449M38.8909 13.4344L-69.4685 121.794"
                      stroke="#292929"
                      stroke-width="3"
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

                {/* <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg> */}
              </Link>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-[hagrid] hover:bg-white hover:text-gray-900 transition-colors">
                Try Demo Portfolio
              </button>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-96 h-1/2 relative">
              <video
                className="w-full h-full object-cover rounded-full shadow-2xl"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src="/videos/hero.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-300 p-6 rounded-lg relative">
              <div className="absolute top-4 right-4 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
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
              <p className="font-[hagrid] text-gray-800 text-sm">
                No account needed, you get instant access to your data.
              </p>
            </div>
            <div className="bg-green-200 p-6 rounded-lg relative">
              <div className="absolute top-4 right-4 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="font-[hagrid] text-gray-800 text-sm">
                100% private, all calculations happen in your browser.
              </p>
            </div>
            <div className="bg-purple-200 p-6 rounded-lg relative">
              <div className="absolute top-4 right-4 w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <p className="font-[hagrid] text-gray-800 text-sm">
                Clean, modern insights Flatex doesn't give you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Steps Section */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold font-[hagrid] mb-12">
            Three simple steps to get started :
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between py-4 border-b border-gray-700">
              <div className="flex items-center space-x-6">
                <span className="text-2xl font-bold font-[hagrid]">01</span>
                <div>
                  <h3 className="text-xl font-[hagrid] mb-1">
                    Export CSV from Flatex
                  </h3>
                  <p className="text-gray-400 font-[hagrid]">
                    Download your portfolio file directly from Flatex.
                  </p>
                </div>
              </div>
              <button
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                onMouseEnter={() => handlePlayButtonHover(1)}
                onMouseLeave={handlePlayButtonLeave}
              >
                <svg
                  className="w-4 h-4 text-gray-900 ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between py-4 border-b border-gray-700">
              <div className="flex items-center space-x-6">
                <span className="text-2xl font-bold font-[hagrid]">02</span>
                <div>
                  <h3 className="text-xl font-[hagrid] mb-1">
                    Upload in Stock Space
                  </h3>
                  <p className="text-gray-400 font-[hagrid]">
                    Drag & drop your CSV file into the upload box on this page.
                  </p>
                </div>
              </div>
              <button
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                onMouseEnter={() => handlePlayButtonHover(2)}
                onMouseLeave={handlePlayButtonLeave}
              >
                <svg
                  className="w-4 h-4 text-gray-900 ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-6">
                <span className="text-2xl font-bold font-[hagrid]">03</span>
                <div>
                  <h3 className="text-xl font-[hagrid] mb-1">
                    Explore insights instantly
                  </h3>
                  <p className="text-gray-400 font-[hagrid]">
                    View your portfolio with modern visualizations and
                    analytics.
                  </p>
                </div>
              </div>
              <button
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                onMouseEnter={() => handlePlayButtonHover(3)}
                onMouseLeave={handlePlayButtonLeave}
              >
                <svg
                  className="w-4 h-4 text-gray-900 ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Stock Space Section */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold font-[hagrid] mb-12">
            Why Stock Space?
          </h2>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400 font-[hagrid] text-lg">
              More content coming soon...
            </p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="bg-ci-yellow rounded-lg p-8 relative">
            <div className="absolute top-4 left-4 w-6 h-6 border-l-4 border-t-4 border-gray-800"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-r-4 border-t-4 border-gray-800"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-l-4 border-b-4 border-gray-800"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-r-4 border-b-4 border-gray-800"></div>
            <div className="flex items-center justify-center">
              <h1 className="text-6xl font-bold font-[hagrid] text-gray-900">
                STCK.SPACE
              </h1>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
