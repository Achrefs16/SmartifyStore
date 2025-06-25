"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

const slides = [
  {
    image: '/images/tech.jpg',
    category: 'Tech & Audio',
    text: "Découvrez les dernières innovations Tech & Audio",
    button: 'Voir la sélection',
    buttonHref: '/products?category=Tech%20%26%20Audio',
    bgGradient: 'from-[#f8fafc] via-[#e0e7ff] to-[#d1fae5]',
    accent: 'from-[#6366f1] to-[#06b6d4]',
    buttonGradient: 'from-[#6366f1] to-[#06b6d4]',
  },
  {
    image: '/images/beauty.jpg',
    category: 'Beauty & Personal Care',
    text: 'Sublimez votre routine beauté et soins',
    button: 'Explorer la beauté',
    buttonHref: '/products?category=Beauty%20%26%20Personal%20Care',
    bgGradient: 'from-[#fff1f7] via-[#f3e8ff] to-[#e0c3fc]',
    accent: 'from-[#f472b6] to-[#c084fc]',
    buttonGradient: 'from-[#f472b6] to-[#c084fc]',
  },
  {
    image: '/images/fragrance.jpg',
    category: 'Fragrances & Scents',
    text: 'Parfums et senteurs pour tous les goûts',
    button: 'Sentir la différence',
    buttonHref: '/products?category=Fragrances%20%26%20Scents',
    bgGradient: 'from-[#fdf6e3] via-[#fde68a] to-[#fbc2eb]',
    accent: 'from-[#fbbf24] to-[#f43f5e]',
    buttonGradient: 'from-[#fbbf24] to-[#f43f5e]',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [imgError, setImgError] = useState([false, false, false]);
  const [isAnimating, setIsAnimating] = useState(true);
  const prevCurrent = useRef(current);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Animation trigger on slide change
  useEffect(() => {
    if (prevCurrent.current !== current) {
      setIsAnimating(false);
      const timeout = setTimeout(() => setIsAnimating(true), 10);
      setDirection(current > prevCurrent.current || (current === 0 && prevCurrent.current === slides.length - 1) ? 1 : -1);
      prevCurrent.current = current;
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [current]);

  const handleImgError = (idx: number) => {
    setImgError((prev) => {
      const copy = [...prev];
      copy[idx] = true;
      return copy;
    });
  };

  const goTo = (dir: 'prev' | 'next') => {
    setCurrent((prev) => {
      if (dir === 'prev') return prev === 0 ? slides.length - 1 : prev - 1;
      return prev === slides.length - 1 ? 0 : prev + 1;
    });
  };

  const slide = slides[current];

  return (
    <section className="relative w-full min-h-[420px] md:min-h-[540px] flex items-center justify-center overflow-hidden">
      {/* Diagonal split background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <polygon points="0,0 60,0 100,100 0,100" fill="url(#heroGradient)" />
          <defs>
            <linearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#f3f4f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Animated content wrapper, horizontal slide/fade animation */}
      <div
        key={current}
        className={`relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 px-4 py-10 md:py-20`}
      >
        {/* Left/Text side */}
        <div
          className={`w-full md:w-1/2 flex flex-col items-start justify-center gap-6 md:gap-10 transition-transform transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isAnimating ? (direction === 1 ? 'animate-hero-slide-in-right' : 'animate-hero-slide-in-left') : ''}`}
        >
          <span className={`text-xs md:text-sm uppercase tracking-widest font-semibold bg-clip-text text-transparent bg-gradient-to-r ${slide.accent}`}>{slide.category}</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-2 md:mb-4">
            <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>{slide.text}</span>
          </h1>
          <Link
            href={slide.buttonHref}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r ${slide.buttonGradient} text-white font-bold shadow-lg hover:opacity-90 transition-all text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#fc6f03]/60`}
          >
            {slide.button}
            <span className="inline-block text-xl md:text-2xl">→</span>
          </Link>
        </div>
        {/* Right/Image side, diagonal crop */}
        <div
          className={`w-full md:w-1/2 flex justify-center items-center relative h-[260px] md:h-[420px] transition-transform transition-opacity duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] delay-100
            ${isAnimating ? (direction === 1 ? 'animate-hero-img-slide-in-right' : 'animate-hero-img-slide-in-left') : ''}`}
        >
          <div className="absolute inset-0 w-full h-full clip-diagonal overflow-hidden">
            <Image
              src={imgError[current] ? '/images/tech.jpg' : slide.image}
              alt={slide.category}
              fill
              className="object-cover w-full h-full"
              onError={() => handleImgError(current)}
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tl from-white/0 via-white/0 to-white/10" />
          </div>
        </div>
      </div>
      {/* Navigation arrows and animated dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        <button
          onClick={() => { setDirection(-1); goTo('prev'); }}
          className="w-10 h-10 rounded-full bg-white/80 border border-gray-200 shadow hover:opacity-80 flex items-center justify-center text-2xl font-bold text-gray-400 hover:text-gray-700 transition-all duration-200 backdrop-blur-md"
          aria-label="Précédent"
        >
          &#8592;
        </button>
        <div className="flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setDirection(idx > current ? 1 : -1); setCurrent(idx); }}
              className={`w-4 h-4 rounded-full border-2 border-white/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#fc6f03]/60
                ${idx === current ? `bg-gradient-to-r ${slide.buttonGradient} scale-125 shadow-lg` : 'bg-white/80 hover:bg-gray-200'}`}
              aria-label={`Aller à la diapositive ${idx + 1}`}
              tabIndex={0}
            />
          ))}
        </div>
        <button
          onClick={() => { setDirection(1); goTo('next'); }}
          className="w-10 h-10 rounded-full bg-white/80 border border-gray-200 shadow hover:opacity-80 flex items-center justify-center text-2xl font-bold text-gray-400 hover:text-gray-700 transition-all duration-200 backdrop-blur-md"
          aria-label="Suivant"
        >
          &#8594;
        </button>
      </div>
      {/* Diagonal clip-path utility and animation */}
      <style jsx>{`
        .clip-diagonal {
          clip-path: polygon(20% 0, 100% 0, 100% 100%, 0% 100%);
        }
        @media (max-width: 768px) {
          .clip-diagonal {
            clip-path: polygon(0 20%, 100% 0, 100% 100%, 0% 100%);
          }
        }
        .animate-hero-slide-in-right {
          animation: heroSlideInRight 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-hero-slide-in-left {
          animation: heroSlideInLeft 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-hero-img-slide-in-right {
          animation: heroImgSlideInRight 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        .animate-hero-img-slide-in-left {
          animation: heroImgSlideInLeft 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes heroSlideInRight {
          0% { opacity: 0; transform: translateX(60px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroSlideInLeft {
          0% { opacity: 0; transform: translateX(-60px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroImgSlideInRight {
          0% { opacity: 0; transform: translateX(80px) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes heroImgSlideInLeft {
          0% { opacity: 0; transform: translateX(-80px) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
    </section>
  );
} 