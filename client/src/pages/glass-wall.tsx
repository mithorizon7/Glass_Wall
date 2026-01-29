import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Shield,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  ChevronRight,
  Info,
  Wifi,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DemoLoginForm } from "@/components/demo-login-form";
import { WireView } from "@/components/wire-view";
import { Timeline } from "@/components/timeline";
import { ControlPanel } from "@/components/control-panel";
import { InfoBanner } from "@/components/info-banner";
import { VpnTunnelOverlay } from "@/components/vpn-tunnel-overlay";
import { ProgressTracker } from "@/components/progress-tracker";
import { ScenarioSelector, SCENARIOS, type Scenario } from "@/components/scenario-selector";
import { LanguageSwitcher } from "@/components/language-switcher";
import { GuidedLearningOverlay, RestartGuideButton } from "@/components/guided-learning-overlay";
import {
  LearningObjectivesCard,
  SuggestedFlowCard,
  SelfCheckCard,
} from "@/components/learning-guidance";
import { LearningToolsHub } from "@/components/learning-tools-hub";

export type ProtocolMode = "http" | "https";
export type VpnMode = "off" | "on";
export type TimelineStage = "idle" | "connect" | "handshake" | "request" | "response" | "complete";
export type AttackerModel = "passive" | "rogueHotspot" | "compromisedEndpoint";
type TimelineSection = "metadata" | "handshake" | "request" | "response";

interface TimelineDeepLink {
  stage: TimelineStage;
  sectionId: TimelineSection;
  protocolMode?: ProtocolMode;
  vpnMode?: VpnMode;
}

export interface DemoPayload {
  action: string;
  method: string;
  path: string;
  domain: string;
  headers: Record<string, string>;
  body: {
    username: string;
    password: string;
  };
}

const DEFAULT_PAYLOAD: Omit<DemoPayload, "body"> = {
  action: "POST /login",
  method: "POST",
  path: "/login",
  domain: "example-login.test",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    Accept: "application/json",
    Host: "example-login.test",
  },
};

function sleep(ms: number, signal: AbortSignal) {
  if (signal.aborted) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const onAbort = () => {
      clearTimeout(timeoutId);
      resolve();
    };
    const timeoutId = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export default function GlassWall() {
  const { t } = useTranslation("glassWall");
  const [protocolMode, setProtocolMode] = useState<ProtocolMode>("http");
  const [vpnMode, setVpnMode] = useState<VpnMode>("off");
  const [attackerModel, setAttackerModel] = useState<AttackerModel>("passive");
  const [autoPlay, setAutoPlay] = useState(true);
  const [stepMode, setStepMode] = useState(true);
  const [timelineStage, setTimelineStage] = useState<TimelineStage>("idle");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModeChangeBanner, setShowModeChangeBanner] = useState(false);
  const [isVpnLimitsOpen, setIsVpnLimitsOpen] = useState(false);
  const [stageAnnouncement, setStageAnnouncement] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [currentScenario, setCurrentScenario] = useState<Scenario>(SCENARIOS[0]);
  const [username, setUsername] = useState("your_username");
  const [password, setPassword] = useState("your_password");
  const animationAbortRef = useRef<AbortController | null>(null);
  const isAnimatingRef = useRef(false);
  const protocolModeRef = useRef<ProtocolMode>(protocolMode);
  const stepModeRef = useRef(stepMode);
  const autoPlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoPlayPlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const previousStageRef = useRef<TimelineStage>("idle");

  const payload: DemoPayload = {
    ...DEFAULT_PAYLOAD,
    body: { username, password },
  };

  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  useEffect(() => {
    protocolModeRef.current = protocolMode;
  }, [protocolMode]);

  useEffect(() => {
    stepModeRef.current = stepMode;
  }, [stepMode]);

  const clearAutoPlayTimers = useCallback(() => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
      autoPlayTimeoutRef.current = null;
    }
    if (autoPlayPlayTimeoutRef.current) {
      clearTimeout(autoPlayPlayTimeoutRef.current);
      autoPlayPlayTimeoutRef.current = null;
    }
  }, []);

  const cancelAnimation = useCallback(() => {
    if (animationAbortRef.current) {
      animationAbortRef.current.abort();
      animationAbortRef.current = null;
    }
    clearAutoPlayTimers();
    isAnimatingRef.current = false;
    setIsAnimating(false);
  }, [clearAutoPlayTimers]);

  const resetTimeline = useCallback(() => {
    cancelAnimation();
    setTimelineStage("idle");
    setExpandedNodes(new Set());
  }, [cancelAnimation]);

  const getExpandedNodesForStage = useCallback((stage: TimelineStage, protocol: ProtocolMode) => {
    if (stage === "idle") return new Set<string>();
    const order: Array<Exclude<TimelineStage, "idle" | "complete">> =
      protocol === "https"
        ? ["connect", "handshake", "request", "response"]
        : ["connect", "request", "response"];
    const sectionMap: Record<Exclude<TimelineStage, "idle" | "complete">, TimelineSection> = {
      connect: "metadata",
      handshake: "handshake",
      request: "request",
      response: "response",
    };
    const normalizedStage = stage === "complete" ? "response" : stage;
    const index = order.indexOf(normalizedStage as Exclude<TimelineStage, "idle" | "complete">);
    if (index < 0) return new Set<string>();
    return new Set(order.slice(0, index + 1).map((item) => sectionMap[item]));
  }, []);

  const playTimeline = useCallback(async () => {
    if (isAnimatingRef.current) return;

    if (animationAbortRef.current) {
      animationAbortRef.current.abort();
    }
    const controller = new AbortController();
    animationAbortRef.current = controller;
    const { signal } = controller;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setExpandedNodes(new Set());

    const currentStepMode = stepModeRef.current;
    const currentProtocol = protocolModeRef.current;

    if (currentStepMode) {
      if (signal.aborted) {
        cancelAnimation();
        return;
      }
      setTimelineStage("connect");
      setExpandedNodes(new Set(["metadata"]));
      cancelAnimation();
      return;
    }

    const stages: TimelineStage[] =
      currentProtocol === "https"
        ? ["connect", "handshake", "request", "response", "complete"]
        : ["connect", "request", "response", "complete"];
    const stageDuration = 1000;

    for (let i = 0; i < stages.length; i++) {
      if (signal.aborted) {
        cancelAnimation();
        return;
      }
      const stage = stages[i];
      setTimelineStage(stage);

      if (stage === "connect") {
        setExpandedNodes(new Set(["metadata"]));
      } else if (stage === "handshake") {
        setExpandedNodes((prev) => new Set([...prev, "handshake"]));
      } else if (stage === "request") {
        setExpandedNodes((prev) => new Set([...prev, "request"]));
      } else if (stage === "response") {
        setExpandedNodes((prev) => new Set([...prev, "response"]));
      }

      if (stage !== "complete") {
        await sleep(stageDuration, signal);
      }
    }

    cancelAnimation();
  }, [cancelAnimation]);

  const handleNextStep = useCallback(() => {
    const stageOrder: TimelineStage[] =
      protocolMode === "https"
        ? ["idle", "connect", "handshake", "request", "response", "complete"]
        : ["idle", "connect", "request", "response", "complete"];

    setTimelineStage((currentStage) => {
      const currentIndex = stageOrder.indexOf(currentStage);
      if (currentIndex < stageOrder.length - 1) {
        const nextStage = stageOrder[currentIndex + 1];
        setExpandedNodes(getExpandedNodesForStage(nextStage, protocolMode));
        return nextStage;
      }
      return currentStage;
    });
  }, [getExpandedNodesForStage, protocolMode]);

  const handlePrevStep = useCallback(() => {
    const stageOrder: TimelineStage[] =
      protocolMode === "https"
        ? ["idle", "connect", "handshake", "request", "response", "complete"]
        : ["idle", "connect", "request", "response", "complete"];

    setTimelineStage((currentStage) => {
      const currentIndex = stageOrder.indexOf(currentStage);
      if (currentIndex > 0) {
        const prevStage = stageOrder[currentIndex - 1];
        setExpandedNodes(getExpandedNodesForStage(prevStage, protocolMode));
        return prevStage;
      }
      return currentStage;
    });
  }, [getExpandedNodesForStage, protocolMode]);

  const handleModeChange = useCallback(
    (type: "protocol" | "vpn", value: string) => {
      cancelAnimation();

      if (type === "protocol") {
        const newProtocol = value as ProtocolMode;
        protocolModeRef.current = newProtocol;
        setProtocolMode(newProtocol);

        if (timelineStage === "handshake" && newProtocol === "http") {
          setTimelineStage("connect");
          setExpandedNodes(new Set(["metadata"]));
        }
      } else {
        setVpnMode(value as VpnMode);
      }

      setShowModeChangeBanner(true);

      if (autoPlay && timelineStage !== "idle") {
        clearAutoPlayTimers();
        autoPlayTimeoutRef.current = setTimeout(() => {
          resetTimeline();
          autoPlayPlayTimeoutRef.current = setTimeout(playTimeline, 300);
        }, 300);
      }
    },
    [autoPlay, timelineStage, resetTimeline, playTimeline, cancelAnimation, clearAutoPlayTimers],
  );

  const handleAutoPlayChange = useCallback(
    (value: boolean) => {
      setAutoPlay(value);
      if (!value) {
        clearAutoPlayTimers();
      }
    },
    [clearAutoPlayTimers],
  );

  const handleStepModeChange = useCallback(
    (value: boolean) => {
      stepModeRef.current = value;
      setStepMode(value);
      resetTimeline();
    },
    [resetTimeline],
  );

  const handleAttackerModelChange = useCallback((value: AttackerModel) => {
    setAttackerModel(value);
  }, []);

  const handleQuizShowTimeline = useCallback(
    (link: TimelineDeepLink) => {
      cancelAnimation();
      const nextProtocol = link.protocolMode ?? protocolModeRef.current;
      if (nextProtocol !== protocolModeRef.current) {
        protocolModeRef.current = nextProtocol;
        setProtocolMode(nextProtocol);
      }
      if (link.vpnMode && link.vpnMode !== vpnMode) {
        setVpnMode(link.vpnMode);
      }
      setTimelineStage(link.stage);
      const expanded = getExpandedNodesForStage(link.stage, nextProtocol);
      expanded.add(link.sectionId);
      setExpandedNodes(expanded);
      timelineRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [cancelAnimation, getExpandedNodesForStage, vpnMode],
  );

  useEffect(() => {
    if (showModeChangeBanner) {
      const timer = setTimeout(() => setShowModeChangeBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showModeChangeBanner]);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    return () => cancelAnimation();
  }, [cancelAnimation]);

  useEffect(() => {
    if (!stepMode) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isAnimatingRef.current) return;
      if (document.querySelector("[data-state='open'][role='dialog']")) return;
      const target = event.target as HTMLElement | null;
      if (target && target.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNextStep();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevStep();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextStep, handlePrevStep, stepMode]);

  useEffect(() => {
    if (previousStageRef.current === timelineStage) return;
    const stageLabel = t(`aria.stages.${timelineStage}`);
    const protocolLabel = t(`aria.protocol.${protocolMode}`);
    const vpnLabel = t(`aria.vpn.${vpnMode}`);
    setStageAnnouncement(
      t("aria.stageChange", { stage: stageLabel, protocol: protocolLabel, vpn: vpnLabel }),
    );
    previousStageRef.current = timelineStage;
  }, [protocolMode, timelineStage, t, vpnMode]);

  const vpnDoesNotBullets = t("vpnActive.doesNotBullets", { returnObjects: true }) as string[];
  const nextPrompt = useMemo(() => {
    if (showModeChangeBanner) return t("nextPrompt.modeChanged");
    if (timelineStage === "idle") return t("nextPrompt.idle");
    if (timelineStage === "complete") return t("nextPrompt.complete");
    if (stepMode) return t("nextPrompt.stepMode");
    return null;
  }, [showModeChangeBanner, stepMode, t, timelineStage]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {stageAnnouncement}
        </div>
        <header className="text-center mb-10 md:mb-12">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
            data-testid="text-page-title"
          >
            {t("title")}
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6"
            data-testid="text-page-subtitle"
          >
            {t("subtitle")}
          </p>
          <div className="max-w-3xl mx-auto mb-6">
            <LearningObjectivesCard />
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div data-onboarding="scenario-selector">
              <ScenarioSelector
                currentScenario={currentScenario}
                onScenarioChange={setCurrentScenario}
                attackerModel={attackerModel}
              />
            </div>
            <div data-onboarding="learning-tools" className="flex items-center gap-3">
              <LearningToolsHub
                payload={payload}
                vpnMode={vpnMode}
                onShowInTimeline={handleQuizShowTimeline}
              />
            </div>
          </div>
        </header>

        {/* Current Scenario - Page Headline */}
        <div className="text-center mb-8" data-testid="scenario-header">
          <div className="inline-flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentScenario.riskLevel === "high"
                  ? "bg-red-500/10"
                  : currentScenario.riskLevel === "medium"
                    ? "bg-amber-500/10"
                    : "bg-green-500/10"
              }`}
            >
              <currentScenario.icon
                className={`w-5 h-5 ${
                  currentScenario.riskLevel === "high"
                    ? "text-red-600 dark:text-red-400"
                    : currentScenario.riskLevel === "medium"
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-green-600 dark:text-green-400"
                }`}
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {t(`scenarioSelector.${currentScenario.id}.name`)}
            </h2>
            <Badge
              className={`text-xs ${
                currentScenario.riskLevel === "high"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  : currentScenario.riskLevel === "medium"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
              }`}
            >
              {currentScenario.riskLevel === "high"
                ? t("highRiskEnvironment")
                : currentScenario.riskLevel === "medium"
                  ? t("mediumRisk")
                  : t("lowRiskEnvironment")}
            </Badge>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {currentScenario.riskLevel === "high"
              ? `${t(`scenarioSelector.${currentScenario.id}.threat1`)}. ${t(`scenarioSelector.${currentScenario.id}.rec1`)}.`
              : currentScenario.riskLevel === "medium"
                ? `${t(`scenarioSelector.${currentScenario.id}.threat1`)}. ${t("considerVpn")}.`
                : t(`scenarioSelector.${currentScenario.id}.rec1`)}
          </p>
        </div>

        <InfoBanner
          type="info"
          icon={<Wifi className="w-5 h-5" />}
          title={t("networkContext.title")}
          message={t(`networkContext.${currentScenario.id}`)}
          className="mb-6"
        />

        {vpnMode === "on" && (
          <div className="mb-4 space-y-3">
            <InfoBanner
              type="info"
              icon={<Shield className="w-5 h-5" />}
              title={t("vpnActive.title")}
              message={t("vpnActive.message")}
            />
            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                <p>{t("vpnActive.dnsLeakNote")}</p>
              </div>
              <Collapsible open={isVpnLimitsOpen} onOpenChange={setIsVpnLimitsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2 px-0 h-auto text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <ChevronRight
                        className={`w-3 h-3 transition-transform ${isVpnLimitsOpen ? "rotate-90" : ""}`}
                      />
                      {t("vpnActive.doesNotTitle")}
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 text-xs text-muted-foreground">
                  <ul className="list-disc pl-5 space-y-1">
                    {Array.isArray(vpnDoesNotBullets) &&
                      vpnDoesNotBullets.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        )}

        {showModeChangeBanner && (
          <div className="mb-6 animate-slide-down" data-testid="banner-mode-change">
            <InfoBanner
              type="info"
              icon={<Info className="w-5 h-5" />}
              title={t("modeChanged.title")}
              message={t("modeChanged.message")}
              dismissible
              onDismiss={() => setShowModeChangeBanner(false)}
            />
          </div>
        )}

        <SuggestedFlowCard
          currentScenario={currentScenario}
          attackerModel={attackerModel}
          timelineStage={timelineStage}
          defaultScenarioId={SCENARIOS[0].id}
          className="mb-6"
        />

        <ControlPanel
          protocolMode={protocolMode}
          vpnMode={vpnMode}
          attackerModel={attackerModel}
          autoPlay={autoPlay}
          stepMode={stepMode}
          onProtocolChange={(value: ProtocolMode) => handleModeChange("protocol", value)}
          onVpnChange={(value: VpnMode) => handleModeChange("vpn", value)}
          onAttackerModelChange={handleAttackerModelChange}
          onAutoPlayChange={handleAutoPlayChange}
          onStepModeChange={handleStepModeChange}
          className="mb-8"
        />

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12"
          data-onboarding="action-area"
        >
          {stepMode && timelineStage !== "idle" && timelineStage !== "complete" ? (
            <Button
              size="lg"
              onClick={handleNextStep}
              className="px-8 py-6 text-lg"
              data-testid="button-next-step"
            >
              <ChevronRight className="w-5 h-5 mr-2" />
              {t("buttons.nextStep")}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={playTimeline}
              disabled={isAnimating}
              className="px-8 py-6 text-lg"
              data-testid="button-send-request"
            >
              <Play className="w-5 h-5 mr-2" />
              {t("buttons.sendRequest")}
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            onClick={resetTimeline}
            disabled={timelineStage === "idle"}
            className="px-6 py-6"
            data-testid="button-replay"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {t("buttons.replayTimeline")}
          </Button>
        </div>
        {nextPrompt && (
          <div className="mb-10 md:mb-12 text-center text-sm text-muted-foreground">
            {nextPrompt}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 md:p-8 relative overflow-visible" data-onboarding="user-view-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2
                  className="text-xl font-semibold text-foreground"
                  data-testid="text-user-view-title"
                >
                  {t("userView.title")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("userView.subtitle")}</p>
              </div>
            </div>
            <DemoLoginForm
              payload={payload}
              protocolMode={protocolMode}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
            />
          </Card>

          <Card className="p-6 md:p-8 relative overflow-visible" data-onboarding="wire-view-card">
            {vpnMode === "on" && <VpnTunnelOverlay />}
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  protocolMode === "https"
                    ? "bg-[hsl(var(--https-success))]/10"
                    : "bg-[hsl(var(--http-danger))]/10"
                }`}
              >
                {protocolMode === "https" ? (
                  <Lock className="w-5 h-5 text-[hsl(var(--https-success))]" />
                ) : (
                  <Unlock className="w-5 h-5 text-[hsl(var(--http-danger))]" />
                )}
              </div>
              <div>
                <h2
                  className="text-xl font-semibold text-foreground"
                  data-testid="text-wire-view-title"
                >
                  {t("wireView.title")}
                </h2>
                <p className="text-sm text-muted-foreground">{t("wireView.subtitle")}</p>
              </div>
              <Badge
                variant="outline"
                className={`ml-auto uppercase tracking-wide font-mono text-xs ${
                  protocolMode === "https"
                    ? "border-[hsl(var(--https-success))] text-[hsl(var(--https-success))]"
                    : "border-[hsl(var(--http-danger))] text-[hsl(var(--http-danger))]"
                }`}
                data-testid="badge-protocol-mode"
              >
                {protocolMode.toUpperCase()}
              </Badge>
            </div>

            <div ref={timelineRef}>
              <Timeline
                stage={timelineStage}
                protocolMode={protocolMode}
                vpnMode={vpnMode}
                attackerModel={attackerModel}
                payload={payload}
                expandedNodes={expandedNodes}
                onToggleNode={toggleNodeExpansion}
                stepMode={stepMode}
              />
            </div>

            <WireView
              stage={timelineStage}
              protocolMode={protocolMode}
              vpnMode={vpnMode}
              attackerModel={attackerModel}
              payload={payload}
            />
          </Card>
        </div>

        <SelfCheckCard isVisible={timelineStage === "complete"} className="mt-10" />

        <div className="mt-10 max-w-md mx-auto" data-onboarding="progress-tracker">
          <ProgressTracker
            currentProtocol={protocolMode}
            currentVpn={vpnMode}
            timelineComplete={timelineStage === "complete"}
          />
        </div>

        <footer className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">{t("footer.simulationNote")}</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Badge variant="secondary">
                    <Shield className="w-3 h-3 mr-1" />
                    {t("footer.zeroRiskLearning")}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t("footer.zeroRiskTooltip")}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Badge variant="secondary">
                    <EyeOff className="w-3 h-3 mr-1" />
                    {t("footer.noTelemetry")}
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t("footer.noTelemetryTooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="mt-4">
            <RestartGuideButton />
          </div>
        </footer>
      </div>
      <GuidedLearningOverlay />
    </div>
  );
}
