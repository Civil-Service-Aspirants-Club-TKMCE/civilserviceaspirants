import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onSignupClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onSignupClick }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. The Safeguard: Stop completely if the HTML elements haven't rendered yet
    if (
      !heroRef.current ||
      !titleRef.current ||
      !subtitleRef.current ||
      !buttonRef.current ||
      !logoRef.current
    ) {
      return;
    }

    const tl = gsap.timeline();

    // Hero entrance animations
    tl.fromTo(
      titleRef.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
    )
      .fromTo(
        subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out" },
        "-=0.8",
      )
      .fromTo(
        buttonRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
        "-=0.5",
      )
      .fromTo(
        logoRef.current,
        { x: 100, opacity: 0, rotation: 180 },
        { x: 0, opacity: 1, rotation: 0, duration: 1.5, ease: "power3.out" },
        "-=1.2",
      );

    // Floating animation for logo (stored in a variable so we can clean it up later)
    const floatAnim = gsap.to(logoRef.current, {
      y: -20,
      duration: 3,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1,
    });

    // Parallax effect
    ScrollTrigger.create({
      trigger: heroRef.current,
      start: "top top",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        // 2. The onUpdate Protection: Double-check the element still exists mid-scroll
        if (heroRef.current) {
          const progress = self.progress;
          gsap.to(heroRef.current, {
            y: progress * 200,
            opacity: 1 - progress * 0.5,
            duration: 0.3,
          });
        }
      },
    });

    // Particle animation (stored in an array so we can clean them up)
    const particleAnims: gsap.core.Tween[] = [];
    const particles = particlesRef.current?.children;
    
    if (particles) {
      Array.from(particles).forEach((particle) => {
        const anim = gsap.to(particle, {
          y: -100 - Math.random() * 200,
          x: Math.random() * 100 - 50,
          opacity: 0,
          duration: 3 + Math.random() * 2,
          delay: Math.random() * 2,
          repeat: -1,
          ease: "power1.out",
        });
        particleAnims.push(anim);
      });
    }

    // 3. The Complete Cleanup: Kill every animation running in this component
    return () => {
      tl.kill();
      floatAnim.kill();
      particleAnims.forEach((anim) => anim.kill());
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="pt-20 min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg"
      style={{ scrollMarginTop: "5rem" }}
    >
      {/* Animated Background Particles */}
      <div
        ref={particlesRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-blue rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/50 to-transparent" />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 px-4 sm:px-6 md:px-8">
        {/* Left Content */}
        <div className="text-center lg:text-left">
          <h1
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">Join us for regular updates on</span>
            <br />
            <span className="text-gray-200">Civil Services Exams</span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0"
          >
            Empowering future civil servants with knowledge, guidance, and
            community support at TKMCE.
          </p>
          <button
            ref={buttonRef}
            onClick={onSignupClick}
            className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 hover:scale-105 transition-all duration-300 inline-flex items-center justify-center text-lg mx-auto lg:mx-0"
          >
            Get Started Today
          </button>
        </div>

        {/* Right Content */}
        <div className="flex justify-center lg:justify-end px-4 sm:px-0">
          <div
            ref={logoRef}
            className="relative w-64 sm:w-72 md:w-80 aspect-square bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-neon-blue/30 shadow-glow animate-float"
          >
            <div className="w-48 sm:w-56 md:w-64 aspect-square bg-gradient-to-br from-neon-blue to-electric-blue rounded-full flex items-center justify-center shadow-neon">
              <img
                src="/logo.jpg"
                alt="Civil Servants Club Logo"
                className="w-36 sm:w-44 md:w-48 aspect-square rounded-full object-cover border-4 border-white/20"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling;
                  if (fallback) fallback.classList.remove("hidden");
                }}
              />
              <div className="hidden w-36 sm:w-44 md:w-48 aspect-square rounded-full bg-white text-dark-900 flex items-center justify-center text-5xl font-extrabold select-none">
                CSC
              </div>
            </div>

            {/* Orbiting Elements */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 sm:w-72 md:w-96 aspect-square">
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 sm:w-4 aspect-square bg-neon-blue rounded-full animate-spin"
                style={{ animationDuration: "10s" }}
              />
              <div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 sm:w-3 aspect-square bg-neon-purple rounded-full animate-spin"
                style={{
                  animationDuration: "15s",
                  animationDirection: "reverse",
                }}
              />
              <div
                className="absolute top-1/2 left-0 transform -translate-y-1/2 w-1.5 sm:w-2 aspect-square bg-electric-blue rounded-full animate-spin"
                style={{ animationDuration: "12s" }}
              />
              <div
                className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 sm:w-3 aspect-square bg-white rounded-full animate-spin"
                style={{
                  animationDuration: "8s",
                  animationDirection: "reverse",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-neon-blue rounded-full flex justify-center animate-bounce">
          <div className="w-1 h-3 bg-neon-blue rounded-full animate-pulse mt-2" />
        </div>
      </div>
    </section>
  );
};

export default Hero;