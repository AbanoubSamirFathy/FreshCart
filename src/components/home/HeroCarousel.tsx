"use client";

import { useEffect, useState } from "react";

type Slide = {
  id: number;
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  bgClassName: string;
};

const slides: Slide[] = [
  {
    id: 1,
    eyebrow: "Fresh Picks",
    title: "Everyday groceries delivered fast",
    description:
      "Shop fruit, vegetables, bakery items, and pantry staples without leaving home.",
    ctaLabel: "Shop now",
    bgClassName:
      "from-emerald-500 via-green-500 to-lime-400 text-white",
  },
  {
    id: 2,
    eyebrow: "Weekly Deals",
    title: "Save more on your next basket",
    description:
      "Catch limited-time offers on family essentials, snacks, and breakfast favorites.",
    ctaLabel: "View offers",
    bgClassName:
      "from-amber-400 via-orange-400 to-rose-400 text-white",
  },
  {
    id: 3,
    eyebrow: "Organic Collection",
    title: "Clean ingredients, bold flavor",
    description:
      "Discover fresh organic produce and carefully sourced products for healthier meals.",
    ctaLabel: "Explore organic",
    bgClassName:
      "from-teal-500 via-cyan-500 to-sky-500 text-white",
  },
];

const AUTO_PLAY_MS = 4500;

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(timer);
  }, []);

  const goToPrev = () => {
    setActiveIndex((currentIndex) =>
      currentIndex === 0 ? slides.length - 1 : currentIndex - 1
    );
  };

  const goToNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl">
      <div className="relative min-h-[24rem] md:min-h-[30rem]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={slide.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 bg-gradient-to-br transition-all duration-700 ${
                slide.bgClassName
              } ${
                isActive
                  ? "translate-x-0 opacity-100"
                  : "pointer-events-none translate-x-8 opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex h-full flex-col justify-center gap-6 px-6 py-10 sm:px-10 md:max-w-2xl md:px-16">
                <span className="w-fit rounded-full bg-white/15 px-4 py-1 text-sm font-semibold tracking-[0.2em] uppercase backdrop-blur-sm">
                  {slide.eyebrow}
                </span>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="max-w-xl text-sm leading-7 text-white/90 sm:text-base">
                    {slide.description}
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                  >
                    {slide.ctaLabel}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-between px-4 sm:px-6">
        <div className="flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex
                  ? "w-10 bg-white"
                  : "w-2.5 bg-white/45 hover:bg-white/70"
              }`}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
            className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
            >
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
