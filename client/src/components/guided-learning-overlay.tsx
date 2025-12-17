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
  Rocket
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "glassWall_onboardingCompleted";

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

interface GuidedLearningStep {
  id: string;
  targetSelector: string | null;
  icon: React.ReactNode;
  position: "center" | "auto";
}

const STEPS: GuidedLearningStep[] = [
  { id: "introduction", targetSelector: null, icon: <Sparkles className="w-6 h-6" />, position: "center" },
  { id: "userView", targetSelector: '[data-onboarding="user-view-card"]', icon: <Eye className="w-6 h-6" />, position: "auto" },
  { id: "wireView", targetSelector: '[data-onboarding="wire-view-card"]', icon: <Radio className="w-6 h-6" />, position: "auto" },
  { id: "protocolToggle", targetSelector: '[data-onboarding="protocol-toggle"]', icon: <Lock className="w-6 h-6" />, position: "auto" },
  { id: "vpnToggle", targetSelector: '[data-onboarding="vpn-toggle"]', icon: <Shield className="w-6 h-6" />, position: "auto" },
  { id: "actionArea", targetSelector: '[data-onboarding="action-area"]', icon: <Play className="w-6 h-6" />, position: "auto" },
  { id: "scenarioSelector", targetSelector: '[data-onboarding="scenario-selector"]', icon: <MapPin className="w-6 h-6" />, position: "auto" },
  { id: "learningTools", targetSelector: '[data-onboarding="learning-tools"]', icon: <BookOpen className="w-6 h-6" />, position: "auto" },
  { id: "progressTracker", targetSelector: '[data-onboarding="progress-tracker"]', icon: <Trophy className="w-6 h-6" />, position: "auto" },
  { id: "ready", targetSelector: null, icon: <Rocket className="w-6 h-6" />, position: "center" },
];

export function GuidedLearningOverlay() {
  const { t } = useTranslation("glassWall");
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const completed = getStorageValue(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (isVisible && nextButtonRef.current) {
      nextButtonRef.current.focus();
    }
  }, [isVisible, currentStep]);

  const updateSpotlight = useCallback(() => {
    const step = STEPS[currentStep];
    if (!step.targetSelector) {
      setSpotlightRect(null);
      return;
    }

    const element = document.querySelector(step.targetSelector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      setTimeout(() => {
        const rect = element.getBoundingClientRect();
        const padding = 12;
        setSpotlightRect({
          top: rect.top - padding + window.scrollY,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });
      }, 350);
    }
  }, [currentStep]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(updateSpotlight, 100);
      const handleResize = () => {
        const step = STEPS[currentStep];
        if (step.targetSelector) {
          const element = document.querySelector(step.targetSelector);
          if (element) {
            const rect = element.getBoundingClientRect();
            const padding = 12;
            setSpotlightRect({
              top: rect.top - padding + window.scrollY,
              left: rect.left - padding,
              width: rect.width + padding * 2,
              height: rect.height + padding * 2,
            });
          }
        }
      };
      window.addEventListener("resize", handleResize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isVisible, updateSpotlight, currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
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
          setCurrentStep(prev => prev + 1);
        } else {
          setStorageValue(STORAGE_KEY, "true");
          setIsVisible(false);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStep > 0) {
          setCurrentStep(prev => prev - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, currentStep]);

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const isIntroOrReady = step.position === "center";

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
                  {spotlightRect && (
                    <rect
                      x={spotlightRect.left}
                      y={spotlightRect.top}
                      width={spotlightRect.width}
                      height={spotlightRect.height}
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
            {spotlightRect && (
              <div
                className="absolute rounded-xl ring-4 ring-primary/50 ring-offset-2 ring-offset-transparent"
                style={{
                  top: spotlightRect.top,
                  left: spotlightRect.left,
                  width: spotlightRect.width,
                  height: spotlightRect.height,
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              />
            )}
          </>
        )}

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10000] w-[90vw] max-w-md">
          <motion.div
            ref={cardRef}
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
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
                      {t("guidedLearning.stepIndicator", { current: currentStep + 1, total: STEPS.length })}
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
                {(t(`guidedLearning.${step.id}.content`, { returnObjects: true }) as string[]).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
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
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    data-testid="button-guide-back"
                  >
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
                  <Button 
                    ref={nextButtonRef}
                    onClick={handleNext} 
                    data-testid="button-guide-next"
                  >
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
