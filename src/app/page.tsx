"use client";

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
        className="min-h-screen max-w-6xl mx-auto flex flex-col"
      >
        <Header />

        <div className="max-w-6xl mx-auto grow flex items-start justify-between ">
          <div className="w-[60%] h-full items-start">
            <h1 className="text-8xl font-bold font-[hagrid] mb-8 leading-tight">
              Launch your portfolio
            </h1>
            <p className="text-3xl font-[urbanist] my-16 text-gray-300 mr-24">
              Upload your Flatex CSV and see your portfolio like never before.
            </p>
            <div className="flex flex-col space-y-4">
              <Link
                href="/fileUpload"
                className="bg-foreground hover:bg-ci-yellow text-background text-xl font-bold font-[urbanist] px-6 py-2 rounded-full transition-colors flex items-center space-x-2 w-fit h-16"
              >
                <span>Upload Your Flatex CSV</span>
                <svg
                  width="53"
                  height="53"
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
              <button className="border border-foreground text-foreground px-6 py-2 cursor-pointer rounded-full font-[urbanist] hover:bg-foreground hover:text-background text-xl font-bold transition-colors w-fit h-16">
                Try Demo Portfolio
              </button>
            </div>
          </div>
          <div className="w-[40%] flex justify-center">
            <div className="w-full h-full relative">
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
      <section id="features" className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Advantage
              title="Instant Access"
              text="No account needed, you get instant access to your data."
              color="bg-foreground"
            />
            <Advantage
              title="Full Privacy"
              text="100% private, all calculations happen in your browser."
              color="bg-ci-yellow"
            />
            <Advantage
              title="Fresh Insights"
              text="Clean, modern insights Flatex doesn’t give you."
              color="bg-ci-purple"
            />
          </div>
        </div>
      </section>

      {/* Three Steps Section */}
      <section id="steps" className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
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

      {/* Why Stock Space Section */}
      <section id="about" className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-7xl font-bold font-[hagrid] mb-12">
            Why Stock Space?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-ci-purple p-8 rounded-2xl">
              <h3 className="text-3xl font-bold font-[hagrid] mb-4 text-background">
                Beyond Basic Charts
              </h3>
              <p className="text-xl font-[urbanist] text-background leading-relaxed">
                Flatex gives you basic portfolio data, but Stock Space
                transforms it into actionable insights. See your portfolio
                allocation, performance trends, and risk metrics in beautiful,
                interactive visualizations.
              </p>
            </div>

            <div className="bg-ci-purple p-8 rounded-2xl">
              <h3 className="text-3xl font-bold font-[hagrid] mb-4 text-background">
                Privacy First
              </h3>
              <p className="text-xl font-[urbanist] text-background leading-relaxed">
                Your financial data never leaves your browser. All calculations
                happen locally, ensuring complete privacy while giving you
                powerful analytics tools.
              </p>
            </div>

            <div className="bg-ci-purple p-8 rounded-2xl">
              <h3 className="text-3xl font-bold font-[hagrid] mb-4 text-background">
                No Account Required
              </h3>
              <p className="text-xl font-[urbanist] text-background leading-relaxed">
                Upload your CSV and start analyzing immediately. No sign-ups, no
                subscriptions, no data collection. Just pure portfolio insights.
              </p>
            </div>

            <div className="bg-ci-purple p-8 rounded-2xl">
              <h3 className="text-3xl font-bold font-[hagrid] mb-4 text-background">
                Modern Interface
              </h3>
              <p className="text-xl font-[urbanist] text-background leading-relaxed">
                Built with modern web technologies for a smooth, responsive
                experience. Clean design that makes complex financial data easy
                to understand.
              </p>
            </div>

            <div className="bg-ci-purple p-8 rounded-2xl">
              <h3 className="text-3xl font-bold font-[hagrid] mb-4 text-background">
                Comprehensive Analysis
              </h3>
              <p className="text-xl font-[urbanist] text-background leading-relaxed">
                From pie charts showing asset allocation to treemaps visualizing
                position sizes, get the insights you need to make informed
                investment decisions.
              </p>
            </div>

            <div className="bg-ci-purple p-8 rounded-2xl">
              <h3 className="text-3xl font-bold font-[hagrid] mb-4 text-background">
                Always Up-to-Date
              </h3>
              <p className="text-xl font-[urbanist] text-background leading-relaxed">
                Import fresh data whenever you want. No waiting for platform
                updates or delayed reporting. Your portfolio analysis is always
                current.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA Section */}
      <section className="px-8 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-6xl font-bold font-[hagrid] mb-12">
            Ready to see your portfolio the way it should be?
          </h2>
          <Link
            href="/fileUpload"
            className="bg-foreground hover:bg-ci-yellow text-background text-2xl font-bold font-[urbanist] px-12 py-6 rounded-full transition-colors inline-flex items-center space-x-4"
          >
            <span>Upload CSV Now</span>
            <svg
              width="53"
              height="53"
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
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="px-8 py-16">
        <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto px-8 py-8 text-center">
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
          onClick={() => scrollToSection("features")}
        >
          features
        </button>
        <button
          className="font-urbanist text-xl text-white px-6 py-2 border border-white rounded-full hover:bg-white hover:text-background transition-all cursor-pointer"
          onClick={() => scrollToSection("steps")}
        >
          steps
        </button>
        <button
          className="font-urbanist text-xl text-white px-6 py-2 border border-white rounded-full hover:bg-white hover:text-background transition-all cursor-pointer"
          onClick={() => scrollToSection("about")}
        >
          about
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
