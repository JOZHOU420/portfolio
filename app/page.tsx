"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  books,
  mediaGroups,
  projects,
  resumePages,
  resumePdf,
  videoWorks,
  type Book,
} from "./portfolio-data";

const heroCards = [
  { src: mediaGroups.homeCover.items[0], alt: "含海量过高动态封面", className: "hero-card--one", kind: "video" },
  { src: mediaGroups.homeCover.items[1], alt: "绿得很具体人物贴纸", className: "hero-card--two", kind: "sticker" },
  { src: mediaGroups.homeCover.items[2], alt: "从小岛毕业小熊贴纸", className: "hero-card--three", kind: "sticker" },
  { src: mediaGroups.homeCover.items[3], alt: "人已在山里人物贴纸", className: "hero-card--four", kind: "sticker" },
  { src: mediaGroups.homeCover.items[4], alt: "一些组队行为静态封面", className: "hero-card--five", kind: "square" },
];

const carouselSlots = [-2, -1, 0, 1, 2] as const;

const gearStickers = [
  { src: "/images/gear/fujifilm-xm5.png", alt: "富士 X-M5 相机贴纸", className: "gear-sticker--xm5", rotation: -7, initialX: 0, initialY: 0 },
  { src: "/images/gear/fujifilm-xs20.png", alt: "富士 X-S20 相机贴纸", className: "gear-sticker--xs20", rotation: 6, initialX: 0, initialY: 0 },
  { src: "/images/gear/lens-35mm.png", alt: "35mm 镜头贴纸", className: "gear-sticker--lens", rotation: 11, initialX: 0, initialY: 0 },
  { src: "/images/gear/instax-mini40.png", alt: "富士 instax mini 40 相机贴纸", className: "gear-sticker--mini40", rotation: -8, initialX: 0, initialY: 0 },
];

type HeroOffset = { x: number; y: number; rotate: number };
type LightboxState = { project: number; image: number } | null;

const isVideo = (src: string) => /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(src);
const wrapIndex = (index: number, total: number) => ((index % total) + total) % total;
const bookPreviewSrc = (src: string) => src.replace("/pages/", "/previews/");

function PortfolioMedia({
  src,
  alt,
  controls = false,
  autoPlay = !controls,
  muted = !controls,
  loop = !controls,
  draggable,
  poster,
  priority = false,
  preload,
}: {
  src: string;
  alt: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  draggable?: boolean;
  poster?: string;
  priority?: boolean;
  preload?: "none" | "metadata" | "auto";
}) {
  const mediaIsVideo = isVideo(src);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!mediaIsVideo || !autoPlay || !video) return;

    const playVideo = () => {
      void video.play().catch(() => undefined);
    };

    if (!("IntersectionObserver" in window)) {
      playVideo();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) playVideo();
        else video.pause();
      },
      { rootMargin: "280px 0px", threshold: 0.01 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [autoPlay, mediaIsVideo, src]);

  if (mediaIsVideo) {
    return (
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={alt}
        controls={controls}
        muted={muted}
        loop={loop}
        playsInline
        preload={preload ?? (priority ? "metadata" : "none")}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      draggable={draggable}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}

function BookPage({ page }: { page: Book["pages"][number] }) {
  const preview = bookPreviewSrc(page.image);
  return (
    <div className="book-page">
      <img
        src={page.image}
        srcSet={`${preview} 1200w, ${page.image} 2400w`}
        sizes="(max-width: 620px) 94vw, min(90vw, 1420px)"
        alt={page.label}
        draggable={false}
        decoding="async"
        fetchPriority="high"
      />
    </div>
  );
}

function FloatingBalloon({
  containerRef,
}: {
  containerRef: { current: HTMLDivElement | null };
}) {
  const balloonRef = useRef<HTMLButtonElement>(null);
  const frameRef = useRef<number | null>(null);
  const motionRef = useRef({
    initialized: false,
    dragging: false,
    thrown: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    grabX: 0,
    grabY: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    lastPointerTime: 0,
    lastFrameTime: 0,
  });

  useEffect(() => {
    const animate = (time: number) => {
      const balloon = balloonRef.current;
      const container = containerRef.current;
      if (!balloon || !container) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const motion = motionRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const balloonWidth = balloon.offsetWidth;
      const balloonHeight = balloon.offsetHeight;
      const sideSpace = Math.max(16, (window.innerWidth - containerWidth) / 2);
      const hasOuterRoom = sideSpace > balloonWidth * 0.68;
      const leftEdge = hasOuterRoom ? -balloonWidth - Math.min(34, sideSpace * 0.1) : 8;
      const rightEdge = hasOuterRoom
        ? containerWidth + Math.min(34, sideSpace * 0.1)
        : containerWidth - balloonWidth - 8;

      if (!motion.initialized) {
        motion.initialized = true;
        motion.x = leftEdge;
        motion.y = containerHeight * 0.22;
        motion.vx = 0.008;
        motion.vy = -0.004;
        motion.angle = -4;
        motion.lastFrameTime = time;
        balloon.style.opacity = "1";
        balloon.style.pointerEvents = "auto";
      }

      const elapsed = Math.min(34, Math.max(1, time - motion.lastFrameTime));
      motion.lastFrameTime = time;

      if (!motion.dragging) {
        if (motion.thrown) {
          motion.vy -= 0.00012 * elapsed;
          motion.vx *= Math.pow(0.999, elapsed / 16);
          motion.vy *= Math.pow(0.999, elapsed / 16);
          motion.x += motion.vx * elapsed;
          motion.y += motion.vy * elapsed;
          motion.angle += motion.angularVelocity * elapsed;

          const isGone =
            motion.x < -balloonWidth * 1.15 ||
            motion.x > containerWidth + sideSpace + balloonWidth * 0.15 ||
            motion.y < -balloonHeight * 1.15 ||
            motion.y > containerHeight + balloonHeight * 0.15;
          if (isGone) {
            balloon.style.opacity = "0";
            balloon.style.pointerEvents = "none";
          }
        } else {
          const phase = (time % 60000) / 60000;
          const ease = (value: number) => value * value * (3 - 2 * value);
          let targetX = leftEdge;
          if (phase >= 0.38 && phase < 0.45) {
            const progress = ease((phase - 0.38) / 0.07);
            targetX = leftEdge + (rightEdge - leftEdge) * progress;
          } else if (phase >= 0.45 && phase < 0.88) {
            targetX = rightEdge;
          } else if (phase >= 0.88 && phase < 0.95) {
            const progress = ease((phase - 0.88) / 0.07);
            targetX = rightEdge + (leftEdge - rightEdge) * progress;
          }
          targetX += Math.sin(time / 5200) * 18;
          const targetY = containerHeight * (0.2 + (Math.cos(time / 13500) + 1) * 0.25);
          motion.vx += (targetX - motion.x) * 0.0000018 * elapsed;
          motion.vy += (targetY - motion.y) * 0.0000015 * elapsed;
          motion.vx += Math.sin(time / 2400) * 0.00016 * elapsed;
          motion.vy += Math.cos(time / 2800) * 0.00012 * elapsed;
          motion.vx *= Math.pow(0.986, elapsed / 16);
          motion.vy *= Math.pow(0.986, elapsed / 16);
          motion.x += motion.vx * elapsed;
          motion.y += motion.vy * elapsed;
          motion.angle = Math.sin(time / 2600) * 5 + motion.vx * 3;
        }
      }

      balloon.style.transform = `translate3d(${motion.x}px, ${motion.y}px, 0) rotate(${motion.angle}deg)`;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [containerRef]);

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const motion = motionRef.current;
    const bounds = container.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    motion.dragging = true;
    motion.thrown = false;
    motion.grabX = event.clientX - bounds.left - motion.x;
    motion.grabY = event.clientY - bounds.top - motion.y;
    motion.lastPointerX = event.clientX;
    motion.lastPointerY = event.clientY;
    motion.lastPointerTime = event.timeStamp;
    motion.vx = 0;
    motion.vy = 0;
    event.currentTarget.style.opacity = "1";
  };

  const dragBalloon = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const container = containerRef.current;
    const motion = motionRef.current;
    if (!container || !motion.dragging) return;
    const bounds = container.getBoundingClientRect();
    const elapsed = Math.max(8, event.timeStamp - motion.lastPointerTime);
    motion.x = event.clientX - bounds.left - motion.grabX;
    motion.y = event.clientY - bounds.top - motion.grabY;
    motion.vx = (event.clientX - motion.lastPointerX) / elapsed;
    motion.vy = (event.clientY - motion.lastPointerY) / elapsed;
    motion.angularVelocity = motion.vx * 0.045;
    motion.angle += motion.vx * 2.2;
    motion.lastPointerX = event.clientX;
    motion.lastPointerY = event.clientY;
    motion.lastPointerTime = event.timeStamp;
  };

  const releaseBalloon = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const motion = motionRef.current;
    if (!motion.dragging) return;
    motion.dragging = false;
    motion.thrown = Math.hypot(motion.vx, motion.vy) > 0.38;
    if (motion.thrown) {
      motion.vx *= 1.45;
      motion.vy *= 1.45;
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const recallBalloon = () => {
    const motion = motionRef.current;
    motion.initialized = false;
    motion.dragging = false;
    motion.thrown = false;
  };

  return (
    <button
      className="floating-balloon"
      ref={balloonRef}
      type="button"
      aria-label="可拖动的气球头。快速甩动可将它扔出画面，双击可召回。"
      title="拖动并甩出去 · 双击召回"
      onPointerDown={beginDrag}
      onPointerMove={dragBalloon}
      onPointerUp={releaseBalloon}
      onPointerCancel={releaseBalloon}
      onDoubleClick={recallBalloon}
    >
      <img src="/images/balloon-head-transparent.png" alt="" draggable={false} aria-hidden="true" />
    </button>
  );
}

function DraggableGearSticker({
  src,
  alt,
  className,
  rotation,
  initialX,
  initialY,
}: {
  src: string;
  alt: string;
  className: string;
  rotation: number;
  initialX: number;
  initialY: number;
}) {
  const stickerRef = useRef<HTMLButtonElement>(null);
  const motionRef = useRef({
    dragging: false,
    x: initialX,
    y: initialY,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const renderPosition = (element: HTMLButtonElement) => {
    const motion = motionRef.current;
    element.style.setProperty("--gear-x", `${motion.x}px`);
    element.style.setProperty("--gear-y", `${motion.y}px`);
  };

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const motion = motionRef.current;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.classList.add("is-dragging");
    motion.dragging = true;
    motion.startX = event.clientX;
    motion.startY = event.clientY;
    motion.originX = motion.x;
    motion.originY = motion.y;
  };

  const dragSticker = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const motion = motionRef.current;
    if (!motion.dragging) return;
    motion.x = motion.originX + event.clientX - motion.startX;
    motion.y = motion.originY + event.clientY - motion.startY;
    renderPosition(event.currentTarget);
  };

  const releaseSticker = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const motion = motionRef.current;
    motion.dragging = false;
    event.currentTarget.classList.remove("is-dragging");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const nudgeSticker = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-10, 0],
      ArrowRight: [10, 0],
      ArrowUp: [0, -10],
      ArrowDown: [0, 10],
    };
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault();
    motionRef.current.x += offset[0];
    motionRef.current.y += offset[1];
    renderPosition(event.currentTarget);
  };

  return (
    <button
      className={`gear-sticker ${className}`}
      ref={stickerRef}
      type="button"
      aria-label={`${alt}，可以拖动`}
      title="拖动摆放"
      style={{
        "--gear-x": `${initialX}px`,
        "--gear-y": `${initialY}px`,
        "--gear-rotation": `${rotation}deg`,
      } as CSSProperties}
      onPointerDown={beginDrag}
      onPointerMove={dragSticker}
      onPointerUp={releaseSticker}
      onPointerCancel={releaseSticker}
      onKeyDown={nudgeSticker}
    >
      <img src={src} alt="" draggable={false} aria-hidden="true" />
    </button>
  );
}

export default function Home() {
  const [heroOffsets, setHeroOffsets] = useState<HeroOffset[]>([
    { x: 0, y: 0, rotate: -7 },
    { x: 0, y: 0, rotate: 3 },
    { x: 0, y: 0, rotate: 8 },
    { x: 0, y: 0, rotate: -4 },
    { x: 0, y: 0, rotate: 5 },
  ]);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [activeBook, setActiveBook] = useState<number | null>(null);
  const [spread, setSpread] = useState(0);
  const [turnDirection, setTurnDirection] = useState<"next" | "prev">("next");
  const [galleryDirection, setGalleryDirection] = useState<"next" | "prev">("next");
  const [resumeOpen, setResumeOpen] = useState(false);
  const [indexHover, setIndexHover] = useState(0);
  const [videoIndexHover, setVideoIndexHover] = useState(0);
  const dragRef = useRef<{
    index: number;
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const bookSwipeStart = useRef<number | null>(null);
  const projectGridRef = useRef<HTMLDivElement>(null);

  const hasOverlay = Boolean(lightbox) || activeBook !== null || resumeOpen;

  useEffect(() => {
    document.body.style.overflow = hasOverlay ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [hasOverlay]);

  useEffect(() => {
    if (activeBook === null) return;
    const pageItems = books[activeBook].pages;
    [spread - 2, spread - 1, spread + 1, spread + 2].forEach((pageIndex) => {
      if (pageIndex < 0 || pageIndex >= pageItems.length) return;
      const preloadImage = new Image();
      preloadImage.src = bookPreviewSrc(pageItems[pageIndex].image);
    });
  }, [activeBook, spread]);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightbox(null);
        setActiveBook(null);
        setResumeOpen(false);
        return;
      }

      if (lightbox && event.key === "ArrowRight") {
        setGalleryDirection("next");
        setLightbox((current) => {
          if (!current) return null;
          const total = projects[current.project].images.length;
          return { ...current, image: (current.image + 1) % total };
        });
      }

      if (lightbox && event.key === "ArrowLeft") {
        setGalleryDirection("prev");
        setLightbox((current) => {
          if (!current) return null;
          const total = projects[current.project].images.length;
          return { ...current, image: (current.image - 1 + total) % total };
        });
      }

      if (activeBook !== null && event.key === "ArrowRight") turnBook("next");
      if (activeBook !== null && event.key === "ArrowLeft") turnBook("prev");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const moveCursor = (event: ReactPointerEvent<HTMLElement>) => {
    if (!cursorRef.current || event.pointerType === "touch") return;
    cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
  };

  const startHeroDrag = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: heroOffsets[index].x,
      originY: heroOffsets[index].y,
    };
  };

  const moveHero = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setHeroOffsets((current) =>
      current.map((item, index) =>
        index === drag.index
          ? {
              ...item,
              x: drag.originX + event.clientX - drag.startX,
              y: drag.originY + event.clientY - drag.startY,
            }
          : item,
      ),
    );
  };

  const endHeroDrag = () => {
    dragRef.current = null;
  };

  const nudgeHero = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const amount = event.shiftKey ? 24 : 8;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-amount, 0],
      ArrowRight: [amount, 0],
      ArrowUp: [0, -amount],
      ArrowDown: [0, amount],
    };
    if (!delta[event.key]) return;
    event.preventDefault();
    setHeroOffsets((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, x: item.x + delta[event.key][0], y: item.y + delta[event.key][1] }
          : item,
      ),
    );
  };

  const shuffleHero = () => {
    setHeroOffsets((current) =>
      current.map((item) => ({
        x: Math.round((Math.random() - 0.5) * 150),
        y: Math.round((Math.random() - 0.5) * 90),
        rotate: item.rotate + Math.round((Math.random() - 0.5) * 18),
      })),
    );
  };

  const changeLightbox = (direction: 1 | -1) => {
    setGalleryDirection(direction === 1 ? "next" : "prev");
    setLightbox((current) => {
      if (!current) return null;
      const total = projects[current.project].images.length;
      return { ...current, image: (current.image + direction + total) % total };
    });
  };

  const openProject = (project: number, image = 0) => {
    setGalleryDirection("next");
    setLightbox({ project, image });
  };

  const closeProject = () => {
    setLightbox(null);
  };

  const openBook = (index: number) => {
    setActiveBook(index);
    setSpread(0);
    setTurnDirection("next");
  };

  const closeBook = () => {
    setActiveBook(null);
  };

  function turnBook(direction: "next" | "prev") {
    if (activeBook === null) return;
    const last = books[activeBook].pages.length - 1;
    setTurnDirection(direction);
    setSpread((currentSpread) => {
      return direction === "next" ? Math.min(last, currentSpread + 1) : Math.max(0, currentSpread - 1);
    });
  }

  const activeProject = lightbox ? projects[lightbox.project] : null;
  const currentBook = activeBook !== null ? books[activeBook] : null;

  return (
    <main onPointerMove={moveCursor}>
      <div className="cursor-dot" ref={cursorRef} aria-hidden="true" />

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Raina portfolio home">
          周小雨 / RAINA®
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Selected work</a>
          <a href="#books">Books</a>
          <button type="button" onClick={() => setResumeOpen(true)}>
            简历 ↗
          </button>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <p className="eyebrow">AI Product Manager · Visual / Image · AI Applications</p>
        <h1 id="hero-title">
          AI products
          <br />
          <span>for visual worlds.</span>
        </h1>
        <p className="hero-intro">
          我是一名 AI 产品经理，专注视觉 / 图像内容及 AI 应用，
          将感知、内容与技术转化为清晰可用的产品体验。
        </p>

        <div className="hero-stage" aria-label="Draggable selected photography collage">
          {heroCards.map((card, index) => (
            <button
              className={`hero-card ${card.className} hero-card--${card.kind}`}
              key={card.src}
              type="button"
              aria-label={`Move image ${index + 1}. Drag or use arrow keys.`}
              onPointerDown={(event) => startHeroDrag(event, index)}
              onPointerMove={moveHero}
              onPointerUp={endHeroDrag}
              onPointerCancel={endHeroDrag}
              onKeyDown={(event) => nudgeHero(event, index)}
              style={
                {
                  "--drag-x": `${heroOffsets[index].x}px`,
                  "--drag-y": `${heroOffsets[index].y}px`,
                  "--drag-rotate": `${heroOffsets[index].rotate}deg`,
                } as CSSProperties
              }
            >
              <PortfolioMedia src={card.src} alt={card.alt} draggable={false} priority={index < 2} />
              <span>0{index + 1}</span>
            </button>
          ))}
          <button className="shuffle-note" type="button" onClick={shuffleHero}>
            点击
            <br />
            点击 ↗
          </button>
        </div>

        <span className="hero-index">01—05 / Drag to compose</span>
        <a className="scroll-cue" href="#work">
          Scroll to explore <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section className="manifesto" aria-label="Artist statement">
        <p className="section-label">Approach — 01</p>
        <p className="manifesto-copy">
          I build AI products where <em>visual intelligence</em> becomes clear,
          useful and ready for people to explore.
        </p>
        <p className="manifesto-copy-zh">
          我热爱摄影、绘画、AI创作等视觉表达方式,也希望打造人人都能轻松打造的AI视觉产品.
        </p>
        <div className="ticker" aria-hidden="true">
          <div>
            AI product strategy · Multimodal experience · Visual content · Prototyping · AI
            product strategy · Multimodal experience ·
          </div>
        </div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        <div className="project-index project-index--lead" aria-label="Project index">
          <p className="section-label">INDEX / HOVER TO PREVIEW</p>
          <p className="index-intro">DIRECTORY</p>

          <div className="index-part">
            <div className="index-part-heading">
              <p><span>PART 1</span> 拍摄作品</p>
              <p>五组摄影作品，记录五个从日常生活里拾起的片段。</p>
            </div>
            <div className="index-layout">
              <div className="index-list">
                {projects.map((project, projectIndex) => (
                  <div
                    className="index-row"
                    key={project.title}
                    onMouseEnter={() => setIndexHover(projectIndex)}
                    onFocus={() => setIndexHover(projectIndex)}
                    tabIndex={0}
                  >
                    <span>0{projectIndex + 1}</span>
                    <strong>{project.title}</strong>
                    <span>{project.kind}</span>
                    <span>{project.year}</span>
                  </div>
                ))}
              </div>
              <figure className="index-preview">
                <PortfolioMedia
                  key={projects[indexHover].images[1] ?? projects[indexHover].images[0]}
                  src={projects[indexHover].images[1] ?? projects[indexHover].images[0]}
                  alt={`${projects[indexHover].title} preview`}
                />
                <figcaption>{projects[indexHover].note}</figcaption>
              </figure>
            </div>
          </div>

          <div className="index-part index-part--video">
            <div className="index-part-heading">
              <p><span>PART 2</span> 视频作品</p>
              <p>三组 AI 视频作品，将图像概念延展为流动叙事。</p>
            </div>
            <div className="index-layout">
              <div className="index-list">
                {videoWorks.map((work, workIndex) => (
                  <div
                    className="index-row"
                    key={work.id}
                    onMouseEnter={() => setVideoIndexHover(workIndex)}
                    onFocus={() => setVideoIndexHover(workIndex)}
                    tabIndex={0}
                  >
                    <span>0{workIndex + 1}</span>
                    <strong>{work.title}</strong>
                    <span>{work.kind}</span>
                    <span>{work.year}</span>
                  </div>
                ))}
              </div>
              <figure className="index-preview index-preview--video">
                <PortfolioMedia
                  key={videoWorks[videoIndexHover].videos[0].src}
                  src={videoWorks[videoIndexHover].videos[0].src}
                  poster={videoWorks[videoIndexHover].videos[0].poster}
                  alt={`${videoWorks[videoIndexHover].title} preview`}
                />
                <figcaption>{videoWorks[videoIndexHover].summary}</figcaption>
              </figure>
            </div>
          </div>
        </div>

        <div className="section-heading">
          <p className="section-label">Selected work — 02</p>
          <h2 id="work-title">Five visual stories</h2>
          <div className="work-guide">
            <span>下一步 / NEXT</span>
            <p>点击任意封面进入对应图组系列，使用左右方向键平滑浏览。</p>
            <strong aria-hidden="true">↓</strong>
          </div>
        </div>

        <div className="project-grid" ref={projectGridRef}>
          {projects.map((project, projectIndex) => (
            <article
              className={`project-card project-card--${projectIndex + 1}`}
              key={project.title}
              style={{ "--card-color": project.color } as CSSProperties}
            >
              <button
                className="project-image"
                type="button"
                onClick={() => openProject(projectIndex)}
                aria-label={`Open ${project.title} series`}
              >
                <PortfolioMedia src={project.images[0]} alt={`${project.title}, ${project.kind}`} />
                <span className="view-tag">{isVideo(project.images[0]) ? "Play video" : "View series"} ↗</span>
              </button>
              <div className="project-meta">
                <span>0{projectIndex + 1}</span>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.kind}</p>
                </div>
                <p>{project.year}</p>
              </div>
            </article>
          ))}
          {gearStickers.map((sticker) => (
            <DraggableGearSticker key={sticker.src} {...sticker} />
          ))}
          <FloatingBalloon containerRef={projectGridRef} />
        </div>

      </section>

      <div className="work-video-transition" aria-hidden="true" />

      <section className="video-section" aria-labelledby="video-work-title">
        <header className="video-section-heading">
          <p className="section-label">PART 2 — AI VIDEO WORKS / 03</p>
          <h2 id="video-work-title">Moving images,<br />made with AI.</h2>
          <p>三个 AI 视频作品，从角色、场景与叙事概念出发，构建可被观看的视觉世界。</p>
        </header>

        <div className="video-projects">
          {videoWorks.map((work, workIndex) => (
            <article
              className={`video-work video-work--${workIndex + 1} video-work--${work.layout}`}
              key={work.id}
            >
              <div className="video-work-copy">
                <p className="video-work-number">VIDEO / 0{workIndex + 1}</p>
                <h3>
                  <span>{work.titleLead}</span>
                  {work.titleAccent && <em>{work.titleAccent}</em>}
                </h3>
                <div className="video-work-about">
                  <strong>About :</strong>
                  <p>{work.about.join("\n")}</p>
                </div>
                <div className="video-work-tools">
                  <strong>tool :</strong>
                  <p>{work.tools}</p>
                </div>
              </div>

              <div className="video-work-stage">
                {work.videos.map((video, videoIndex) => (
                  <figure key={video.src}>
                    <PortfolioMedia
                      src={video.src}
                      poster={video.poster}
                      alt={video.label}
                      controls
                    />
                    <div className="video-rotate-prompt" role="img" aria-label="请旋转手机横屏观看视频">
                      <span className="video-rotate-orbit" aria-hidden="true" />
                      <span className="video-rotate-device" aria-hidden="true" />
                    </div>
                    {work.videos.length > 1 && (
                      <figcaption>Scene {String(videoIndex + 1).padStart(2, "0")}</figcaption>
                    )}
                  </figure>
                ))}
              </div>

              <div className="video-assets">
                <p>ASSETS <span>{String(work.assets.length).padStart(2, "0")}</span></p>
                <div>
                  {work.assets.map((asset, assetIndex) => (
                    <figure key={asset}>
                      <img
                        src={asset}
                        alt={`${work.title} 视觉素材 ${assetIndex + 1}`}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="books-section" id="books" aria-labelledby="books-title">
        <div className="books-heading">
          <p className="section-label">Printed matter — 04</p>
          <h2 id="books-title">
            Portfolio
            <br />
            过往设计作品集
          </h2>
          <p>收录过往的视觉与环境设计项目，欢迎选择一本，随意翻翻。</p>
        </div>
        <div className="book-shelf">
          {books.map((book, index) => (
            <button
              className="book-object"
              type="button"
              key={book.title}
              onClick={() => openBook(index)}
              aria-label={`Open ${book.title}`}
            >
              <span className="book-cover">
                <PortfolioMedia src={book.cover} alt={`${book.title} cover`} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title">
        <p className="section-label">Information — 05</p>
        <div className="about-grid">
          <h2 id="about-title">Available for images, ideas and beautiful problems.</h2>
          <div className="about-copy">
            <p>
            Raina / 周小雨是一名 AI 产品经理，专注视觉 / 图像内容及 AI 应用，
            工作横跨产品策略、多模态体验、视觉内容。
            </p>
            <p className="contact-details">
              <span>电话 / 微信</span>
              <a href="tel:13114936926">13114936926（微信同号）</a>
              <span>邮箱</span>
              <a href="mailto:1341059849@qq.com">1341059849@qq.com</a>
            </p>
            <button className="resume-button" type="button" onClick={() => setResumeOpen(true)}>
              全屏查看简历 <span>↗</span>
            </button>
          </div>
        </div>
      </section>

      <footer>
        <a className="footer-cta" href="mailto:1341059849@qq.com">
          <span className="footer-cta-en">Empowering everyone to create something worth seeing.</span>
          <span className="footer-cta-zh">让每个人都能创造值得被看见的作品。</span>
        </a>
        <div>
          <span>Shenzhen / Beijing</span>
          <span>© 2026 RAINA</span>
          <a href="#top">Back to top ↑</a>
        </div>
      </footer>

      {lightbox && activeProject && (
        <div
          className="overlay lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeProject.title} gallery`}
        >
          <div className="overlay-topbar">
            <div>
              <strong>{activeProject.title}</strong>
              <span>{activeProject.kind}</span>
            </div>
            <p>
              {String(lightbox.image + 1).padStart(2, "0")} / {String(activeProject.images.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={closeProject} aria-label="Close gallery">
              Close ×
            </button>
          </div>
          <button className="lightbox-nav lightbox-nav--prev" type="button" onClick={() => changeLightbox(-1)} aria-label="Previous image">
            ←
          </button>
          <div className="orbit-carousel" aria-live="polite">
            <div
              className={`orbit-track orbit-track--${galleryDirection}`}
              key={`${lightbox.project}-${lightbox.image}-${galleryDirection}`}
            >
              {carouselSlots.map((slot) => {
                const imageIndex = wrapIndex(lightbox.image + slot, activeProject.images.length);
                const src = activeProject.images[imageIndex];
                const fromSlot = slot + (galleryDirection === "next" ? 1 : -1);
                return (
                  <figure
                    className={`orbit-item${slot === 0 ? " orbit-item--center" : ""}${Math.abs(slot) === 2 ? " orbit-item--far" : ""}`}
                    key={slot}
                    style={{ "--slot": slot, "--from-slot": fromSlot } as CSSProperties}
                    aria-hidden={slot !== 0}
                  >
                    <PortfolioMedia
                      src={src}
                      alt={`${activeProject.title} media ${imageIndex + 1}`}
                      autoPlay={slot === 0}
                      muted
                      loop
                      priority={slot === 0}
                    />
                  </figure>
                );
              })}
            </div>
            <p className="orbit-caption">{activeProject.note}</p>
          </div>
          <button className="lightbox-nav lightbox-nav--next" type="button" onClick={() => changeLightbox(1)} aria-label="Next image">
            →
          </button>
        </div>
      )}

      {currentBook && activeBook !== null && (
        <div
          className="overlay book-reader"
          role="dialog"
          aria-modal="true"
          aria-label={`${currentBook.title} reader`}
        >
          <div className="overlay-topbar overlay-topbar--light">
            <div>
              <strong>{currentBook.title}</strong>
              <span>{currentBook.edition}</span>
            </div>
            <p>
              Page {String(spread + 1).padStart(2, "0")} / {String(currentBook.pages.length).padStart(2, "0")}
            </p>
            <button type="button" onClick={closeBook} aria-label="Close book">
              Close ×
            </button>
          </div>

          <div
            className="reader-stage"
            onPointerDown={(event) => {
              bookSwipeStart.current = event.clientX;
            }}
            onPointerUp={(event) => {
              if (bookSwipeStart.current === null) return;
              const distance = event.clientX - bookSwipeStart.current;
              if (Math.abs(distance) > 45) turnBook(distance < 0 ? "next" : "prev");
              bookSwipeStart.current = null;
            }}
          >
            <button
              className="reader-hit reader-hit--left"
              type="button"
              onClick={() => turnBook("prev")}
              disabled={spread === 0}
              aria-label="Previous spread"
            >
              <span aria-hidden="true">←</span>
            </button>
            <div className="open-book">
              <div
                className={`book-under-page book-under-page--${turnDirection}`}
                key={`${activeBook}-${spread}`}
                aria-hidden="true"
              >
                <BookPage page={currentBook.pages[spread]} />
              </div>
              <span className="book-page-edge" aria-hidden="true" />
            </div>
            <button
              className="reader-hit reader-hit--right"
              type="button"
              onClick={() => turnBook("next")}
              disabled={spread === currentBook.pages.length - 1}
              aria-label="Next spread"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="reader-controls">
            <button type="button" onClick={() => turnBook("prev")} disabled={spread === 0}>
              ← 上一页
            </button>
            <p>点击页面左右两侧 · 左右滑动 · 或使用方向键</p>
            <button type="button" onClick={() => turnBook("next")} disabled={spread === currentBook.pages.length - 1}>
              下一页 →
            </button>
          </div>
        </div>
      )}

      {resumeOpen && (
        <div className="overlay resume-overlay" role="dialog" aria-modal="true" aria-labelledby="resume-title">
          <button className="resume-close" type="button" onClick={() => setResumeOpen(false)}>
            Close résumé ×
          </button>
          <div className="resume-document" id="resume-title">
            {resumePages.map((page, index) => (
              <img src={page} alt={`周小雨简历第 ${index + 1} 页`} key={page} />
            ))}
          </div>
          <a className="resume-pdf-link" href={resumePdf} target="_blank" rel="noreferrer">
            Open original PDF ↗
          </a>
        </div>
      )}
    </main>
  );
}
