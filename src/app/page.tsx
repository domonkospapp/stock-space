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
        className="h-[calc(100vh-80px)] max-w-7xl mx-auto px-8 flex flex-col justify-between py-4 overflow-hidden"
      >
        <div className="flex-1 flex items-center min-h-0 py-4">
          <div className="grid grid-cols-12 gap-8 w-full items-center">
            {/* Astronaut on left */}
            <div className="col-span-5 flex justify-center items-center">
              <Astronaut3D />
            </div>

            {/* Content on right */}
            <div className="col-span-7 flex flex-col gap-6">
              <h1 className="text-7xl font-hagrid leading-tight font-bold uppercase tracking-wide">
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
        <div
          className="flex items-end justify-center flex-shrink-0 pb-8"
          style={{ height: "clamp(60px, 12vh, 120px)" }}
        >
          <div className="w-full max-w-7xl mx-auto h-full flex items-end mb-10">
            <Image
              src="/stockspacetext.png"
              alt="STCK SPACE"
              width={1200}
              height={200}
              className="w-auto h-full max-w-full object-contain"
              style={{ maxHeight: "100%", width: "auto" }}
            />
          </div>
        </div>
      </section>

      {/* Your Flatex data, decoded Section */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-6xl font-bold font-hagrid text-foreground mb-6">
            Your Flatex data, decoded.
          </h2>
          <div className="space-y-2">
            <p className="text-lg font-space-mono text-gray-300">
              Instant visual insight.
            </p>
            <p className="text-lg font-space-mono text-gray-300">
              Zero accounts. Zero servers
            </p>
          </div>
        </div>
      </section>

      {/* Data Visualization Section (Upper) */}
      <section id="about" className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Card 1: Distribution */}
            <div className="bg-[#2A2A2A] border border-foreground/10 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex-1">
                <Image
                  src="/peaks/page1.png"
                  alt="Distribution chart"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <p className="p-6 text-center text-lg font-space-mono text-foreground">
                Distribution at glance
              </p>
            </div>

            {/* Card 2: Growth */}
            <div className="bg-[#2A2A2A] border border-foreground/10 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex-1">
                <Image
                  src="/peaks/page2.png"
                  alt="Growth chart"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <p className="p-6 text-center text-lg font-space-mono text-foreground">
                Your growth over time
              </p>
            </div>

            {/* Card 3: Stock Count */}
            <div className="bg-[#2A2A2A] border border-foreground/10 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex-1">
                <Image
                  src="/peaks/page3.png"
                  alt="Stock count chart"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              <p className="p-6 text-center text-lg font-space-mono text-foreground">
                Cumulative stock count
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mid-Page Heading */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-6xl font-bold font-hagrid uppercase tracking-tight leading-tight">
            <div>PRIVATE</div>
            <div>INSTANT ACCESS</div>
            <div>BUYING PATTERNS</div>
          </h2>
          <div className="mt-8 space-y-2">
            <p className="text-lg font-space-mono text-gray-300">
              All calculations run in your browser.
            </p>
            <p className="text-lg font-space-mono text-gray-300">
              Your data never leaves your device.
            </p>
          </div>
        </div>
      </section>

      {/* Data Visualization Section (Lower) */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto relative">
          <Image
            src="/group.png"
            alt="Portfolio visualization"
            width={1200}
            height={800}
            className="w-full h-auto"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-space-mono text-gray-300 text-center">
              Upload your Flatex CSV and <br /> enter a clearer view of
              <br /> your portfolio.
            </p>
          </div>
        </div>
      </section>

      {/* Three Steps Section */}
      <section id="steps" className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-7xl font-bold font-hagrid mb-12">
            Three simple steps
            <br /> to get started:
          </h2>
          <div className="border-t border-foreground/30">
            <StepExplanation
              rowIndex={1}
              title="Export CSV from Flatex"
              description="Download your portfolio CSV."
              onMouseEnter={() => handlePlayButtonHover(1)}
              onMouseLeave={handlePlayButtonLeave}
            />
            <div className="border-t border-foreground/30"></div>
            <StepExplanation
              rowIndex={2}
              title="Import to STCK.SPACE"
              description="Load the file directly into your browser."
              onMouseEnter={() => handlePlayButtonHover(2)}
              onMouseLeave={handlePlayButtonLeave}
            />
            <div className="border-t border-foreground/30"></div>
            <StepExplanation
              rowIndex={3}
              title="Analyze your data"
              description="View distribution, growth, and buying patterns."
              onMouseEnter={() => handlePlayButtonHover(3)}
              onMouseLeave={handlePlayButtonLeave}
            />
            <div className="border-t border-foreground/30"></div>
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
    <div className="flex items-center justify-between py-6">
      <div className="flex items-center space-x-8">
        <span className="text-7xl font-bold font-hagrid text-foreground">
          0{rowIndex}
        </span>
        <div>
          <h3 className="text-2xl font-bold font-space-mono mb-1 text-foreground">
            {title}
          </h3>
          <p className="text-foreground font-space-mono">{description}</p>
        </div>
      </div>
      <button
        className="w-16 h-16 border border-foreground rounded-full flex items-center justify-center hover:bg-foreground/10 group transition-colors cursor-pointer"
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
