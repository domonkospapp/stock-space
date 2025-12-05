"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import Astronaut3D from "./components/Astronaut3D";

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
      className="min-h-screen bg-[#1A1A1A] text-foreground relative"
      onMouseMove={handleMouseMove}
      style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }}
    >
      {/* Header Navigation */}
      <Header />

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
        className="min-h-screen max-w-7xl mx-auto px-8 flex flex-col py-16"
      >
        <div className="flex-1 flex items-center">
          <div className="grid grid-cols-12 gap-8 w-full items-center">
            {/* Astronaut on left */}
            <div className="col-span-5 flex justify-center items-center">
              <Astronaut3D />
            </div>

            {/* Content on right */}
            <div className="col-span-7 flex flex-col gap-8">
              <h1 className="text-7xl font-hagrid leading-tight font-bold uppercase tracking-tight">
                ANALYSE STOCKS DIFFERENTLY
              </h1>
              <p className="text-xl font-space-mono text-gray-300 max-w-2xl leading-relaxed">
                Upload your Flatex CSV and see
                <br />
                your portfolio like never before.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/fileUpload"
                  className="bg-ci-yellow hover:bg-ci-yellow/80 text-[#1A1A1A] text-lg font-bold font-space-mono px-8 py-4 rounded-full transition-colors flex items-center space-x-2 shadow-lg"
                >
                  <span>Upload Flatex CSV</span>
                  <ArrowUpRightIcon className="w-5 h-5" weight="bold" />
                </Link>
                <button className="border border-foreground text-foreground px-6 py-4 cursor-pointer rounded-full font-space-mono hover:bg-foreground hover:text-[#1A1A1A] text-lg font-bold transition-colors">
                  Try Demo Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STCK SPACE text image */}
        <div className="mt-16 w-full">
          <div className="max-w-7xl mx-auto">
            <Image
              src="/stockspacetext.png"
              alt="STCK SPACE"
              width={1200}
              height={200}
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Data Visualization Section (Upper) */}
      <section id="about" className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Distribution */}
            <div className="bg-[#2A2A2A] border border-foreground/10 rounded-2xl p-6">
              <div className="text-3xl font-bold font-hagrid mb-2">
                $1,247,890
              </div>
              <h3 className="text-xl font-hagrid mb-4 text-gray-300">
                Your distribution at a glance
              </h3>
              <div className="h-64 flex items-center justify-center bg-[#1A1A1A] rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-space-mono text-gray-400 mb-2">
                    Pie Chart Placeholder
                  </div>
                  <div className="text-xs font-space-mono text-gray-500">
                    DYN 7.4% • TSLA 68.2% • AMD 8.5% • PUNT 9.4% • 6.4%
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Growth */}
            <div className="bg-[#2A2A2A] border border-foreground/10 rounded-2xl p-6">
              <div className="text-3xl font-bold font-hagrid mb-2">
                $1,247,890
              </div>
              <h3 className="text-xl font-hagrid mb-4 text-gray-300">
                Your growth over time
              </h3>
              <div className="h-64 flex items-center justify-center bg-[#1A1A1A] rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-space-mono text-gray-400 mb-2">
                    Line Graph Placeholder
                  </div>
                  <div className="text-xs font-space-mono text-gray-500">
                    Jan 2018 - May 2024
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Stock Count */}
            <div className="bg-[#2A2A2A] border border-foreground/10 rounded-2xl p-6">
              <h3 className="text-xl font-hagrid mb-2 text-gray-300">
                Cumulative PUNT Stock Count Over Time
              </h3>
              <div className="text-sm font-space-mono text-gray-400 mb-4">
                Sany
              </div>
              <div className="h-64 flex items-center justify-center bg-[#1A1A1A] rounded-lg">
                <div className="text-center w-full">
                  <div className="text-sm font-space-mono text-gray-400 mb-2">
                    Bar Chart Placeholder
                  </div>
                  <div className="text-xs font-space-mono text-gray-500 space-y-1">
                    <div>dec: 147 sh</div>
                    <div>okt: 132 sh</div>
                    <div>nov: 112 sh</div>
                    <div>aug: 90 sh</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mid-Page Heading */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-6xl font-bold font-hagrid uppercase tracking-tight">
            PRIVATE INSTANT ACCESS BUYING PATTERNS
          </h2>
        </div>
      </section>

      {/* Data Visualization Section (Lower) */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Left Visual */}
            <div className="bg-[#2A2A2A] border border-foreground/10 rounded-2xl p-6">
              <div className="text-2xl font-bold font-hagrid mb-2">$8,800</div>
              <div className="text-xl font-hagrid mb-4">24.5%</div>
              <div className="h-32 flex items-center justify-center bg-[#1A1A1A] rounded-lg">
                <div className="text-sm font-space-mono text-gray-400">
                  Line Graph
                </div>
              </div>
            </div>

            {/* Middle Text */}
            <div className="text-center">
              <p className="text-lg font-space-mono text-gray-300">
                Upload your Flatex CSV and see your portfolio like never before.
              </p>
            </div>

            {/* Right Visual */}
            <div className="bg-[#2A2A2A] border border-foreground/10 rounded-2xl p-6">
              <div className="text-xl font-hagrid mb-2">DYNATRACE INC</div>
              <div className="text-2xl font-bold font-hagrid mb-2">€750.00</div>
              <div className="text-sm font-space-mono text-gray-400 mb-1">
                8 shares
              </div>
              <div className="text-sm font-space-mono text-gray-400 mb-4">
                €57.00 avg
              </div>
              <div className="text-3xl font-bold font-hagrid text-ci-yellow mb-4">
                6.4%
              </div>
              <button className="text-sm font-space-mono text-gray-300 hover:text-foreground flex items-center space-x-1">
                <span>Click to view purchase history</span>
                <ArrowUpRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Visual */}
          <div className="mt-8 bg-[#2A2A2A] border border-foreground/10 rounded-2xl p-6">
            <div className="h-48 flex items-center justify-center bg-[#1A1A1A] rounded-lg">
              <div className="text-center w-full">
                <div className="text-sm font-space-mono text-gray-400 mb-4">
                  Bar Chart - 2025
                </div>
                <div className="text-xs font-space-mono text-gray-500 space-y-1">
                  <div>dec: 147 sh</div>
                  <div>okt: 132 sh</div>
                  <div>nov: 112 sh</div>
                  <div>aug: 90 sh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Steps Section */}
      <section id="steps" className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-7xl font-bold font-hagrid mb-12 uppercase">
            Three simple steps to get started:
          </h2>
          <div className="space-y-8">
            <StepExplanation
              rowIndex={1}
              title="Export CSV from Flatex"
              description="Download your portfolio file directly from Flatex."
              onMouseEnter={() => handlePlayButtonHover(1)}
              onMouseLeave={handlePlayButtonLeave}
            />
            <StepExplanation
              rowIndex={2}
              title="Export CSV from Flatex"
              description="Download your portfolio file directly from Flatex."
              onMouseEnter={() => handlePlayButtonHover(2)}
              onMouseLeave={handlePlayButtonLeave}
            />
            <StepExplanation
              rowIndex={3}
              title="Export CSV from Flatex"
              description="Download your portfolio file directly from Flatex."
              onMouseEnter={() => handlePlayButtonHover(3)}
              onMouseLeave={handlePlayButtonLeave}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm font-space-mono text-gray-400">
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
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-8">
        <span className="text-7xl font-bold font-hagrid text-gray-600">
          0{rowIndex}
        </span>
        <div>
          <h3 className="text-2xl font-space-mono mb-1 text-foreground">
            {title}
          </h3>
          <p className="text-gray-400 font-space-mono">{description}</p>
        </div>
      </div>
      <button
        className="w-16 h-16 border-foreground/30 border rounded-full flex items-center justify-center hover:bg-foreground/10 group transition-colors cursor-pointer"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <svg
          className="w-6 h-6 text-foreground ml-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
        </svg>
      </button>
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
    <header className="flex justify-between items-center py-8 px-8 w-full max-w-7xl mx-auto">
      {/* Logo */}
      <div className="flex items-center space-x-3">
        <Image
          src="/astronaut.svg"
          alt="stck.space"
          width={32}
          height={32}
          className="w-8 h-8"
        />
        <span className="font-space-mono text-xl text-foreground">
          stck.space
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex space-x-2">
        <button
          className="font-space-mono text-lg text-foreground px-4 py-2 hover:text-gray-300 transition-colors cursor-pointer lowercase"
          onClick={() => scrollToSection("hero")}
        >
          home
        </button>
        <button
          className="font-space-mono text-lg text-foreground px-4 py-2 hover:text-gray-300 transition-colors cursor-pointer lowercase"
          onClick={() => scrollToSection("about")}
        >
          about
        </button>
        <button
          className="font-space-mono text-lg text-foreground px-4 py-2 hover:text-gray-300 transition-colors cursor-pointer lowercase"
          onClick={() => scrollToSection("steps")}
        >
          demo
        </button>
      </nav>

      {/* Login */}
      <Link
        href="/login"
        className="font-space-mono text-lg text-foreground hover:text-gray-300 transition-colors lowercase"
      >
        login
      </Link>
    </header>
  );
};
