import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Shield,
  ShieldOff,
  Lock,
  Unlock,
  Play,
  RotateCcw,
  ChevronRight,
  Info,
  Wifi,
  Server,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";
import { DemoLoginForm } from "@/components/demo-login-form";
import { WireView } from "@/components/wire-view";
import { Timeline } from "@/components/timeline";
import { ControlPanel } from "@/components/control-panel";
import { InfoBanner } from "@/components/info-banner";
import { VpnTunnelOverlay } from "@/components/vpn-tunnel-overlay";
import { CheatSheetModal } from "@/components/cheat-sheet-modal";
import { ProgressTracker } from "@/components/progress-tracker";
import { ComparisonView } from "@/components/comparison-view";
import { ScenarioSelector, SCENARIOS, type Scenario } from "@/components/scenario-selector";
import { QuizMode } from "@/components/quiz-mode";
import { LanguageSwitcher } from "@/components/language-switcher";
import { GuidedLearningOverlay, RestartGuideButton } from "@/components/guided-learning-overlay";

export type ProtocolMode = "http" | "https";
export type VpnMode = "off" | "on";
export type TimelineStage = "idle" | "connect" | "handshake" | "request" | "response" | "complete";

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

const DEFAULT_PAYLOAD: Omit<DemoPayload, 'body'> = {
  action: "POST /login",
  method: "POST",
  path: "/login",
  domain: "example-login.test",
  headers: {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Accept": "application/json",
    "Host": "example-login.test",
  },
};

export default function GlassWall() {
  const { t } = useTranslation("glassWall");
  const [protocolMode, setProtocolMode] = useState<ProtocolMode>("http");
  const [vpnMode, setVpnMode] = useState<VpnMode>("off");
  const autoPlay = true;
  const stepMode = true;
  const [timelineStage, setTimelineStage] = useState<TimelineStage>("idle");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModeChangeBanner, setShowModeChangeBanner] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [currentScenario, setCurrentScenario] = useState<Scenario>(SCENARIOS[0]);
  const [username, setUsername] = useState("your_username");
  const [password, setPassword] = useState("your_password");

  const payload: DemoPayload = {
    ...DEFAULT_PAYLOAD,
    body: { username, password },
  };

  const resetTimeline = useCallback(() => {
    setTimelineStage("idle");
    setIsAnimating(false);
    setExpandedNodes(new Set());
  }, []);

  const playTimeline = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setExpandedNodes(new Set());
    
    if (stepMode) {
      setTimelineStage("connect");
      setExpandedNodes(new Set(["metadata"]));
      setIsAnimating(false);
      return;
    }
    
    const stages: TimelineStage[] = protocolMode === "https"
      ? ["connect", "handshake", "request", "response", "complete"]
      : ["connect", "request", "response", "complete"];
    const stageDuration = 1000;
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setTimelineStage(stage);
      
      if (stage === "connect") {
        setExpandedNodes(new Set(["metadata"]));
      } else if (stage === "handshake") {
        setExpandedNodes(prev => new Set([...prev, "handshake"]));
      } else if (stage === "request") {
        setExpandedNodes(prev => new Set([...prev, "request"]));
      } else if (stage === "response") {
        setExpandedNodes(prev => new Set([...prev, "response"]));
      }
      
      if (stage !== "complete") {
        await new Promise(resolve => setTimeout(resolve, stageDuration));
      }
    }
    
    setIsAnimating(false);
  }, [isAnimating, stepMode, protocolMode]);

  const handleNextStep = useCallback(() => {
    const stageOrder: TimelineStage[] = protocolMode === "https"
      ? ["idle", "connect", "handshake", "request", "response", "complete"]
      : ["idle", "connect", "request", "response", "complete"];
    
    setTimelineStage(currentStage => {
      const currentIndex = stageOrder.indexOf(currentStage);
      if (currentIndex < stageOrder.length - 1) {
        const nextStage = stageOrder[currentIndex + 1];
        
        if (nextStage === "connect") {
          setExpandedNodes(new Set(["metadata"]));
        } else if (nextStage === "handshake") {
          setExpandedNodes(prev => new Set([...prev, "handshake"]));
        } else if (nextStage === "request") {
          setExpandedNodes(prev => new Set([...prev, "request"]));
        } else if (nextStage === "response") {
          setExpandedNodes(prev => new Set([...prev, "response"]));
        }
        
        return nextStage;
      }
      return currentStage;
    });
  }, [protocolMode]);

  const handleModeChange = useCallback((type: "protocol" | "vpn", value: string) => {
    if (type === "protocol") {
      const newProtocol = value as ProtocolMode;
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
      setTimeout(() => {
        resetTimeline();
        setTimeout(playTimeline, 300);
      }, 300);
    }
  }, [autoPlay, timelineStage, resetTimeline, playTimeline]);

  useEffect(() => {
    if (showModeChangeBanner) {
      const timer = setTimeout(() => setShowModeChangeBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showModeChangeBanner]);

  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
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
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div data-onboarding="scenario-selector">
              <ScenarioSelector 
                currentScenario={currentScenario} 
                onScenarioChange={setCurrentScenario} 
              />
            </div>
            <div data-onboarding="learning-tools" className="flex items-center gap-3">
              <CheatSheetModal />
              <ComparisonView payload={payload} vpnMode={vpnMode} />
              <QuizMode />
            </div>
          </div>
        </header>

        <InfoBanner 
          type="warning"
          icon={<Wifi className="w-5 h-5" />}
          title={t("publicNetworkWarning.title")}
          message={t("publicNetworkWarning.message")}
          className="mb-4"
        />

        {/* Current Scenario Header */}
        <Card className="mb-6 overflow-visible" data-testid="scenario-header">
          <div className={`p-4 sm:p-6 ${
            currentScenario.riskLevel === "high" 
              ? "bg-gradient-to-r from-red-500/5 to-transparent" 
              : currentScenario.riskLevel === "medium"
              ? "bg-gradient-to-r from-amber-500/5 to-transparent"
              : "bg-gradient-to-r from-green-500/5 to-transparent"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 ${
                currentScenario.riskLevel === "high" 
                  ? "bg-red-500/10" 
                  : currentScenario.riskLevel === "medium"
                  ? "bg-amber-500/10"
                  : "bg-green-500/10"
              }`}>
                <currentScenario.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${
                  currentScenario.riskLevel === "high" 
                    ? "text-red-600 dark:text-red-400" 
                    : currentScenario.riskLevel === "medium"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-green-600 dark:text-green-400"
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    {t(`scenarioSelector.${currentScenario.id}.name`)}
                  </h2>
                  <Badge className={`text-xs ${
                    currentScenario.riskLevel === "high" 
                      ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" 
                      : currentScenario.riskLevel === "medium"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                  }`}>
                    {currentScenario.riskLevel === "high" 
                      ? t("highRiskEnvironment")
                      : currentScenario.riskLevel === "medium"
                      ? t("mediumRisk")
                      : t("lowRiskEnvironment")
                    }
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentScenario.riskLevel === "high" 
                    ? `${t(`scenarioSelector.${currentScenario.id}.threat1`)}. ${t(`scenarioSelector.${currentScenario.id}.rec1`)}.`
                    : currentScenario.riskLevel === "medium"
                    ? `${t(`scenarioSelector.${currentScenario.id}.threat1`)}. ${t("considerVpn")}.`
                    : t(`scenarioSelector.${currentScenario.id}.rec1`)
                  }
                </p>
              </div>
            </div>
          </div>
        </Card>

        {vpnMode === "on" && (
          <InfoBanner 
            type="info"
            icon={<Shield className="w-5 h-5" />}
            title={t("vpnActive.title")}
            message={t("vpnActive.message")}
            className="mb-4"
          />
        )}

        {showModeChangeBanner && (
          <div 
            className="mb-6 animate-slide-down"
            data-testid="banner-mode-change"
          >
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

        <ControlPanel
          protocolMode={protocolMode}
          vpnMode={vpnMode}
          onProtocolChange={(value: ProtocolMode) => handleModeChange("protocol", value)}
          onVpnChange={(value: VpnMode) => handleModeChange("vpn", value)}
          className="mb-8"
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12" data-onboarding="action-area">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 md:p-8 relative overflow-visible" data-onboarding="user-view-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-user-view-title">
                  {t("userView.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("userView.subtitle")}
                </p>
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
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                protocolMode === "https" 
                  ? "bg-[hsl(var(--https-success))]/10" 
                  : "bg-[hsl(var(--http-danger))]/10"
              }`}>
                {protocolMode === "https" ? (
                  <Lock className="w-5 h-5 text-[hsl(var(--https-success))]" />
                ) : (
                  <Unlock className="w-5 h-5 text-[hsl(var(--http-danger))]" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-wire-view-title">
                  {t("wireView.title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("wireView.subtitle")}
                </p>
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
            
            <Timeline
              stage={timelineStage}
              protocolMode={protocolMode}
              vpnMode={vpnMode}
              payload={payload}
              expandedNodes={expandedNodes}
              onToggleNode={toggleNodeExpansion}
              stepMode={stepMode}
            />

            <WireView
              stage={timelineStage}
              protocolMode={protocolMode}
              vpnMode={vpnMode}
              payload={payload}
            />
          </Card>
        </div>

        <div className="mt-10 max-w-md mx-auto" data-onboarding="progress-tracker">
          <ProgressTracker
            currentProtocol={protocolMode}
            currentVpn={vpnMode}
            timelineComplete={timelineStage === "complete"}
          />
        </div>

        <footer className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t("footer.simulationNote")}
          </p>
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
