import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Eye,
  Radio,
  Lock,
  Shield,
  Play,
  MapPin,
  BookOpen,
  Trophy,
  Rocket,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "glassWall_onboardingCompleted";
const SPOTLIGHT_PADDING = 12;
const CARD_MARGIN = 16;
const SCROLL_MARGIN = 100;

function getStorageValue(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStorageValue(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface CardPosition {
  top: number;
  left: number;
  placement: "top" | "bottom" | "left" | "right";
}

interface GuidedLearningStep {
  id: string;
  targetSelector: string | null;
  icon: React.ReactNode;
  position: "center" | "auto";
}

const STEPS: GuidedLearningStep[] = [
  {
    id: "introduction",
    targetSelector: null,
    icon: <Sparkles className="w-6 h-6" />,
    position: "center",
  },
  {
    id: "userView",
    targetSelector: '[data-onboarding="user-view-card"]',
    icon: <Eye className="w-6 h-6" />,
    position: "auto",
  },
  {
    id: "wireView",
    targetSelector: '[data-onboarding="wire-view-card"]',
    icon: <Radio className="w-6 h-6" />,
    position: "auto",
  },
  {
    id: "protocolToggle",
    targetSelector: '[data-onboarding="protocol-toggle"]',
    icon: <Lock className="w-6 h-6" />,
    position: "auto",
  },
  {
    id: "vpnToggle",
    targetSelector: '[data-onboarding="vpn-toggle"]',
    icon: <Shield className="w-6 h-6" />,
    position: "auto",
  },
  {
    id: "actionArea",
    targetSelector: '[data-onboarding="action-area"]',
    icon: <Play className="w-6 h-6" />,
    position: "auto",
  },
  {
    id: "scenarioSelector",
    targetSelector: '[data-onboarding="scenario-selector"]',
    icon: <MapPin className="w-6 h-6" />,
    position: "auto",
  },
  {
    id: "learningTools",
    targetSelector: '[data-onboarding="learning-tools"]',
    icon: <BookOpen className="w-6 h-6" />,
    position: "auto",
  },
  {
    id: "progressTracker",
    targetSelector: '[data-onboarding="progress-tracker"]',
    icon: <Trophy className="w-6 h-6" />,
    position: "auto",
  },
  { id: "ready", targetSelector: null, icon: <Rocket className="w-6 h-6" />, position: "center" },
];

function computeCardPosition(
  spotlightRect: SpotlightRect | null,
  cardWidth: number,
  cardHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): CardPosition | null {
  if (!spotlightRect || viewportWidth === 0 || viewportHeight === 0) return null;

  const spotlightCenterX = spotlightRect.left + spotlightRect.width / 2;
  const spotlightCenterY = spotlightRect.top + spotlightRect.height / 2;

  const spaceAbove = spotlightRect.top - SCROLL_MARGIN;
  const spaceBelow = viewportHeight - (spotlightRect.top + spotlightRect.height) - SCROLL_MARGIN;
  const spaceLeft = spotlightRect.left - CARD_MARGIN;
  const spaceRight = viewportWidth - (spotlightRect.left + spotlightRect.width) - CARD_MARGIN;

  let placement: "top" | "bottom" | "left" | "right" = "bottom";
  let top = 0;
  let left = 0;

  // Prefer bottom, then top, then sides
  if (spaceBelow >= cardHeight + CARD_MARGIN) {
    placement = "bottom";
    top = spotlightRect.top + spotlightRect.height + CARD_MARGIN;
    left = Math.max(
      CARD_MARGIN,
      Math.min(spotlightCenterX - cardWidth / 2, viewportWidth - cardWidth - CARD_MARGIN),
    );
  } else if (spaceAbove >= cardHeight + CARD_MARGIN) {
    placement = "top";
    top = spotlightRect.top - cardHeight - CARD_MARGIN;
    left = Math.max(
      CARD_MARGIN,
      Math.min(spotlightCenterX - cardWidth / 2, viewportWidth - cardWidth - CARD_MARGIN),
    );
  } else if (spaceRight >= cardWidth + CARD_MARGIN) {
    placement = "right";
    left = spotlightRect.left + spotlightRect.width + CARD_MARGIN;
    top = Math.max(
      CARD_MARGIN,
      Math.min(spotlightCenterY - cardHeight / 2, viewportHeight - cardHeight - CARD_MARGIN),
    );
  } else if (spaceLeft >= cardWidth + CARD_MARGIN) {
    placement = "left";
    left = spotlightRect.left - cardWidth - CARD_MARGIN;
    top = Math.max(
      CARD_MARGIN,
      Math.min(spotlightCenterY - cardHeight / 2, viewportHeight - cardHeight - CARD_MARGIN),
    );
  } else {
    // Fallback: position at bottom of viewport
    placement = "bottom";
    top = viewportHeight - cardHeight - CARD_MARGIN * 2;
    left = Math.max(CARD_MARGIN, (viewportWidth - cardWidth) / 2);
  }

  return { top, left, placement };
}

function useTourTarget(
  selector: string | null,
  isActive: boolean,
): { rect: SpotlightRect | null; isReady: boolean } {
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [isReady, setIsReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup any previous observers
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    if (!isActive || !selector) {
      setRect(null);
      setIsReady(true);
      return;
    }

    if (typeof window === "undefined") {
      setIsReady(true);
      return;
    }

    setIsReady(false);
    let cancelled = false;
    let element: Element | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let rafId: number | null = null;
    let scrollTimeout: number | null = null;

    const updateRect = () => {
      if (cancelled || !element) return;

      const domRect = element.getBoundingClientRect();
      setRect({
        top: domRect.top - SPOTLIGHT_PADDING,
        left: domRect.left - SPOTLIGHT_PADDING,
        width: domRect.width + SPOTLIGHT_PADDING * 2,
        height: domRect.height + SPOTLIGHT_PADDING * 2,
      });
      setIsReady(true);
    };

    const scheduleUpdate = () => {
      if (cancelled) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateRect);
    };

    const handleScroll = () => scheduleUpdate();

    const setupObservers = (el: Element) => {
      element = el;

      // Scroll element into view first
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });

      // Initial measurement after scroll settles
      scrollTimeout = window.setTimeout(() => {
        if (!cancelled) updateRect();
      }, 400);

      // ResizeObserver for size changes
      resizeObserver = new ResizeObserver(() => {
        if (!cancelled) scheduleUpdate();
      });
      resizeObserver.observe(el);

      // Scroll/resize handlers
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });
    };

    const cleanup = () => {
      cancelled = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };

    cleanupRef.current = cleanup;

    // Find element with retry for async rendering
    const foundElement = document.querySelector(selector);
    if (foundElement) {
      setupObservers(foundElement);
    } else {
      // Retry for dynamically rendered elements
      let attempts = 0;
      const maxAttempts = 10;
      const retryInterval = setInterval(() => {
        if (cancelled) {
          clearInterval(retryInterval);
          return;
        }
        attempts++;
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(retryInterval);
          setupObservers(el);
        } else if (attempts >= maxAttempts) {
          clearInterval(retryInterval);
          setIsReady(true);
        }
      }, 50);

      // Store interval cleanup in the main cleanup
      const originalCleanup = cleanup;
      cleanupRef.current = () => {
        clearInterval(retryInterval);
        originalCleanup();
      };
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [selector, isActive]);

  return { rect, isReady };
}

function useViewportSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateSize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize, { passive: true });
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return size;
}

export function GuidedLearningOverlay() {
  const { t } = useTranslation("glassWall");
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [cardDimensions, setCardDimensions] = useState({ width: 400, height: 300 });
  const cardRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  const step = STEPS[currentStep];
  const isIntroOrReady = step.position === "center";

  const { rect: spotlightRect, isReady } = useTourTarget(
    step.targetSelector,
    isVisible && !isIntroOrReady,
  );

  const viewport = useViewportSize();

  // Lock body scroll when overlay is visible
  useEffect(() => {
    if (!isVisible) return;
    if (typeof window === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isVisible]);

  // Measure card dimensions for positioning
  useEffect(() => {
    if (cardRef.current) {
      const { width, height } = cardRef.current.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setCardDimensions({ width, height });
      }
    }
  }, [currentStep, isVisible]);

  // Calculate card position based on spotlight (SSR-safe)
  const cardPosition =
    !isIntroOrReady && spotlightRect && viewport.width > 0
      ? computeCardPosition(
          spotlightRect,
          cardDimensions.width,
          cardDimensions.height,
          viewport.width,
          viewport.height,
        )
      : null;

  useEffect(() => {
    const completed = getStorageValue(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible && nextButtonRef.current && isReady) {
      nextButtonRef.current.focus();
    }
  }, [isVisible, currentStep, isReady]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    setStorageValue(STORAGE_KEY, "true");
    setIsVisible(false);
  }, []);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  const restartGuide = useCallback(() => {
    setCurrentStep(0);
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).restartGuidedLearning = restartGuide;
    return () => {
      delete (window as any).restartGuidedLearning;
    };
  }, [restartGuide]);

  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setStorageValue(STORAGE_KEY, "true");
        setIsVisible(false);
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        if (currentStep < STEPS.length - 1) {
          setCurrentStep((prev) => prev + 1);
        } else {
          setStorageValue(STORAGE_KEY, "true");
          setIsVisible(false);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, currentStep]);

  if (!isVisible) return null;

  const showSpotlight = !isIntroOrReady && spotlightRect && isReady;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999]"
        style={{ pointerEvents: "auto" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guided-learning-title"
        aria-describedby="guided-learning-content"
      >
        {isIntroOrReady ? (
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
            aria-hidden="true"
          />
        ) : (
          <>
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
              aria-hidden="true"
            >
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {showSpotlight && spotlightRect.width > 0 && spotlightRect.height > 0 && (
                    <motion.rect
                      initial={{ opacity: 0, x: 0, y: 0, width: 100, height: 100 }}
                      animate={{
                        x: spotlightRect.left ?? 0,
                        y: spotlightRect.top ?? 0,
                        width: spotlightRect.width ?? 100,
                        height: spotlightRect.height ?? 100,
                        opacity: 1,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      rx="12"
                      fill="black"
                    />
                  )}
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.75)"
                mask="url(#spotlight-mask)"
              />
            </svg>
            {showSpotlight && spotlightRect.width > 0 && spotlightRect.height > 0 && (
              <motion.div
                initial={{ opacity: 0, top: 0, left: 0, width: 100, height: 100 }}
                animate={{
                  top: spotlightRect.top ?? 0,
                  left: spotlightRect.left ?? 0,
                  width: spotlightRect.width ?? 100,
                  height: spotlightRect.height ?? 100,
                  opacity: 1,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute rounded-xl ring-4 ring-primary/50 ring-offset-2 ring-offset-transparent"
                style={{ pointerEvents: "none" }}
                aria-hidden="true"
              />
            )}
          </>
        )}

        {/* Card Container - either centered or positioned near spotlight */}
        <div
          className={
            isIntroOrReady
              ? "fixed inset-0 flex items-center justify-center p-4 z-[10000]"
              : "fixed z-[10000]"
          }
          style={
            !isIntroOrReady && cardPosition
              ? {
                  top: cardPosition.top,
                  left: cardPosition.left,
                  maxWidth: "calc(100vw - 32px)",
                }
              : !isIntroOrReady
                ? {
                    bottom: CARD_MARGIN * 2,
                    left: "50%",
                    transform: "translateX(-50%)",
                    maxWidth: "calc(100vw - 32px)",
                  }
                : undefined
          }
        >
          <motion.div
            ref={cardRef}
            key={currentStep}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="p-6 shadow-2xl border-primary/20 bg-card/95 backdrop-blur-md">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <div>
                    <h3
                      id="guided-learning-title"
                      className="text-lg font-semibold text-foreground"
                    >
                      {t(`guidedLearning.${step.id}.title`)}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t("guidedLearning.stepIndicator", {
                        current: currentStep + 1,
                        total: STEPS.length,
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSkip}
                  className="text-muted-foreground shrink-0"
                  data-testid="button-skip-guide"
                  aria-label={t("guidedLearning.skip")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div
                id="guided-learning-content"
                className="text-sm text-muted-foreground space-y-3 mb-6 leading-relaxed"
              >
                {(t(`guidedLearning.${step.id}.content`, { returnObjects: true }) as string[]).map(
                  (paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ),
                )}
              </div>

              <div className="flex items-center gap-2 mb-4" aria-hidden="true">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i === currentStep
                        ? "bg-primary"
                        : i < currentStep
                          ? "bg-primary/40"
                          : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-2">
                {currentStep > 0 ? (
                  <Button variant="ghost" onClick={handleBack} data-testid="button-guide-back">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {t("guidedLearning.back")}
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-muted-foreground"
                    data-testid="button-guide-skip"
                  >
                    {t("guidedLearning.skip")}
                  </Button>
                )}

                {currentStep < STEPS.length - 1 ? (
                  <Button ref={nextButtonRef} onClick={handleNext} data-testid="button-guide-next">
                    {t("guidedLearning.next")}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    ref={nextButtonRef}
                    onClick={handleComplete}
                    data-testid="button-guide-complete"
                  >
                    {t("guidedLearning.startExploring")}
                    <Rocket className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function RestartGuideButton() {
  const { t } = useTranslation("glassWall");

  const handleRestart = () => {
    if (typeof window !== "undefined" && (window as any).restartGuidedLearning) {
      (window as any).restartGuidedLearning();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRestart}
      className="text-muted-foreground"
      data-testid="button-restart-guide"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      {t("guidedLearning.restartGuide")}
    </Button>
  );
}
