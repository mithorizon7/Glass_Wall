import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, PlayCircle, BookOpen, CheckCircle2 } from "lucide-react";
import type { TimelineStage, AttackerModel } from "@/pages/glass-wall";
import type { Scenario } from "@/components/scenario-selector";

const SELF_CHECK_STORAGE_KEY = "glass-wall-self-check";

function safeStorageGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors (private mode, blocked storage)
  }
}

interface LearningObjectivesCardProps {
  className?: string;
}

export function LearningObjectivesCard({ className = "" }: LearningObjectivesCardProps) {
  const { t } = useTranslation("glassWall");
  const objectives = t("objectives.items", { returnObjects: true }) as string[];

  return (
    <Card className={`p-5 text-left ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <h3 className="font-semibold text-foreground">{t("objectives.title")}</h3>
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {Array.isArray(objectives) &&
          objectives.map((item, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
              <span>{item}</span>
            </li>
          ))}
      </ul>
    </Card>
  );
}

interface SuggestedFlowCardProps {
  currentScenario: Scenario;
  attackerModel: AttackerModel;
  timelineStage: TimelineStage;
  defaultScenarioId: Scenario["id"];
  className?: string;
}

export function SuggestedFlowCard({
  currentScenario,
  attackerModel,
  timelineStage,
  defaultScenarioId,
  className = "",
}: SuggestedFlowCardProps) {
  const { t } = useTranslation("glassWall");

  const hasChosenSetup = currentScenario.id !== defaultScenarioId || attackerModel !== "passive";
  const hasRunTimeline = timelineStage !== "idle";
  const isComplete = timelineStage === "complete";

  const activeStep = useMemo(() => {
    if (!hasChosenSetup) return 1;
    if (!hasRunTimeline) return 2;
    if (!isComplete) return 2;
    return 3;
  }, [hasChosenSetup, hasRunTimeline, isComplete]);

  const steps = [
    {
      id: 1,
      title: t("flow.step1.title"),
      body: t("flow.step1.body"),
      hint: t("flow.step1.hint"),
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      id: 2,
      title: t("flow.step2.title"),
      body: t("flow.step2.body"),
      hint: t("flow.step2.hint"),
      icon: <PlayCircle className="w-4 h-4" />,
    },
    {
      id: 3,
      title: t("flow.step3.title"),
      body: t("flow.step3.body"),
      hint: t("flow.step3.hint"),
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{t("flow.title")}</h3>
          <p className="text-xs text-muted-foreground">{t("flow.subtitle")}</p>
        </div>
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
          {t("flow.badge")}
        </Badge>
      </div>
      <div className="space-y-3">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleteStep = step.id < activeStep;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                isActive
                  ? "border-primary/40 bg-primary/5"
                  : isCompleteStep
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-border/60 bg-muted/40"
              }`}
            >
              <div
                className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isCompleteStep
                      ? "bg-emerald-500 text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {t("flow.stepLabel", { step: step.id })}
                  </span>
                  {isActive && (
                    <Badge className="bg-primary/10 text-primary text-[10px]">
                      {t("flow.current")}
                    </Badge>
                  )}
                  {isCompleteStep && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                      {t("flow.complete")}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.body}</p>
                <p className="text-[11px] text-muted-foreground/80 mt-1">{step.hint}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface SelfCheckCardProps {
  isVisible: boolean;
  className?: string;
}

export function SelfCheckCard({ isVisible, className = "" }: SelfCheckCardProps) {
  const { t } = useTranslation("glassWall");
  const items = t("selfCheck.items", { returnObjects: true }) as string[];
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const [checked, setChecked] = useState<boolean[]>([]);

  useEffect(() => {
    if (!safeItems.length) return;
    const stored = safeStorageGet(SELF_CHECK_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as boolean[];
      if (Array.isArray(parsed)) {
        setChecked(parsed.slice(0, safeItems.length));
      }
    } catch {
      // ignore parse errors
    }
  }, [safeItems]);

  useEffect(() => {
    if (!safeItems.length) return;
    setChecked((prev) => {
      if (prev.length === safeItems.length) return prev;
      if (prev.length > 0) return prev.slice(0, safeItems.length);
      return safeItems.map(() => false);
    });
  }, [safeItems]);

  useEffect(() => {
    if (!checked.length) return;
    safeStorageSet(SELF_CHECK_STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  if (!isVisible) return null;

  return (
    <Card className={`p-5 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <h3 className="font-semibold text-foreground">{t("selfCheck.title")}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{t("selfCheck.subtitle")}</p>
      <div className="space-y-3">
        {safeItems.map((item, index) => (
          <label key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
            <Checkbox
              checked={checked[index] ?? false}
              onCheckedChange={(value) => {
                setChecked((prev) => {
                  const next = [...prev];
                  next[index] = Boolean(value);
                  return next;
                });
              }}
              aria-label={item}
            />
            <span>{item}</span>
          </label>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground/80">{t("selfCheck.helper")}</p>
    </Card>
  );
}
