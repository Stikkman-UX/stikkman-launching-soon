"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Testimonial } from "@/app/(Home)/data/testimonials";
import { lockBodyScroll } from "@/lib/scrollLock";

import "swiper/css";
import HighlightMark from "@/app/shared/HighlightMark";

const MIN_SLIDES_FOR_LOOP = 8;

function TestimonialSlide({
  testimonial,
  onOpenVideo,
}: {
  testimonial: Testimonial;
  onOpenVideo: (url: string) => void;
}) {
  const isVideo = testimonial.media.type === "video";

  function handlePlayClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onOpenVideo(testimonial.media.url);
  }

  return (
    <div className="testimonial-card relative h-full w-full overflow-hidden rounded-sm bg-neutral-900 ">
      {isVideo ? (
        // Paused thumbnail only — actual playback happens in the fullscreen
        // overlay, never inline in the card.
        <video
          src={testimonial.media.url}
          muted
          playsInline
          controls={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${testimonial.media.url})` }}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/90 via-black/50 to-transparent md:h-3/4 " />

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* `swiper-no-swiping`: without it, Swiper reads the inevitable
              few px of finger movement during a tap as the start of a drag
              and preventDefaults the touch, which swallows the synthetic
              click mobile browsers would otherwise fire here — the button
              works on desktop (plain mouse clicks, no gesture detection)
              but silently never opens the lightbox on touch devices. */}
          <button
            type="button"
            onClick={handlePlayClick}
            aria-label="Play video"
            className="swiper-no-swiping flex h-14 w-14 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm"
          >
            <svg
              className="ml-1 h-5 w-5 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      )}

      {/* pointer-events-none: purely text/avatar, nothing here is
          interactive. On narrow viewports the card is narrower (`w-[75vw]`)
          and the author block stacks below the quote (pre-`sm`), so this
          block's box can grow tall enough to reach the vertically-centered
          play button above and, being later in the DOM, silently swallow
          its tap despite having no visible content there. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-4 px-6 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <HighlightMark text="Client testimonial" invert className="text-white uppercase " />
          <p className="no-text-trim mt-4 lg:mt-8 max-w-md text-lg text-white">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div
            className="h-9 w-9 shrink-0 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${testimonial.avatar})` }}
          />
          <div className="text-sm">
            <p className="no-text-trim text-white">{testimonial.author}</p>
            <p className="no-text-trim text-white/50">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoLightbox({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const unlockBodyScroll = lockBodyScroll();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockBodyScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    // Mobile Safari/Chrome don't honor the `autoPlay` attribute on an
    // unmuted <video> mounted from a state update — attribute-driven
    // autoplay is never treated as gesture-initiated, so it's silently
    // blocked. An explicit `.play()` call here (still within the same tap
    // that opened the lightbox) IS treated as gesture-initiated and is what
    // actually starts playback on mobile, matching desktop's behavior.
    videoRef.current?.play().catch(() => {});
  }, [url]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      <video
        ref={videoRef}
        src={url}
        controls
        playsInline
        className="max-h-full max-w-full"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export default function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const repeats = Math.ceil(MIN_SLIDES_FOR_LOOP / testimonials.length);
  const slides = Array.from({ length: repeats }, () => testimonials).flat();

  return (
    <>
      <Swiper
        className="testimonial-swiper !overflow-visible"
        modules={[Autoplay]}
        centeredSlides
        loop
        slidesPerView="auto"
        spaceBetween={5}
        speed={700}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
      >
        {slides.map((testimonial, i) => (
          <SwiperSlide
            key={`${testimonial.slug}-${i}`}
            className="!w-[75vw] !h-[60vh] lg:!h-[70vh] rounded-sm! overflow-hidden! "
          >
            <TestimonialSlide
              testimonial={testimonial}
              onOpenVideo={setActiveVideoUrl}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {activeVideoUrl && (
        <VideoLightbox
          url={activeVideoUrl}
          onClose={() => setActiveVideoUrl(null)}
        />
      )}
    </>
  );
}
