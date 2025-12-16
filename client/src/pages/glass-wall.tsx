import { useState, useCallback, useEffect } from "react";
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

export type ProtocolMode = "http" | "https";
export type VpnMode = "off" | "on";
export type TimelineStage = "idle" | "connect" | "request" | "response" | "complete";

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

const DEMO_PAYLOAD: DemoPayload = {
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
  body: {
    username: "demo_user",
    password: "not_a_real_password",
  },
};

export default function GlassWall() {
  const [protocolMode, setProtocolMode] = useState<ProtocolMode>("http");
  const [vpnMode, setVpnMode] = useState<VpnMode>("off");
  const [autoPlay, setAutoPlay] = useState(false);
  const [stepMode, setStepMode] = useState(false);
  const [timelineStage, setTimelineStage] = useState<TimelineStage>("idle");
  const [isAnimating, setIsAnimating] = useState(false);
  const [showModeChangeBanner, setShowModeChangeBanner] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

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
    
    const stages: TimelineStage[] = ["connect", "request", "response", "complete"];
    const stageDuration = 1000;
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      setTimelineStage(stage);
      
      if (stage === "connect") {
        setExpandedNodes(new Set(["metadata"]));
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
  }, [isAnimating, stepMode]);

  const handleNextStep = useCallback(() => {
    const stageOrder: TimelineStage[] = ["idle", "connect", "request", "response", "complete"];
    
    setTimelineStage(currentStage => {
      const currentIndex = stageOrder.indexOf(currentStage);
      if (currentIndex < stageOrder.length - 1) {
        const nextStage = stageOrder[currentIndex + 1];
        
        if (nextStage === "connect") {
          setExpandedNodes(new Set(["metadata"]));
        } else if (nextStage === "request") {
          setExpandedNodes(prev => new Set([...prev, "request"]));
        } else if (nextStage === "response") {
          setExpandedNodes(prev => new Set([...prev, "response"]));
        }
        
        return nextStage;
      }
      return currentStage;
    });
  }, []);

  const handleModeChange = useCallback((type: "protocol" | "vpn", value: string) => {
    if (type === "protocol") {
      setProtocolMode(value as ProtocolMode);
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
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4"
            data-testid="text-page-title"
          >
            The Glass Wall
          </h1>
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            data-testid="text-page-subtitle"
          >
            See what happens when you send data over the network. 
            Toggle between HTTP and HTTPS to understand encryption—no real data leaves your browser.
          </p>
        </header>

        <InfoBanner 
          type="warning"
          icon={<Wifi className="w-5 h-5" />}
          title="Public Wi-Fi Advisory"
          message="Public networks increase risk of deception (rogue hotspots, fake portals). Encryption reduces some risks, but judgment still matters."
          className="mb-8"
        />

        {showModeChangeBanner && (
          <div 
            className="mb-6 animate-slide-down"
            data-testid="banner-mode-change"
          >
            <InfoBanner 
              type="info"
              icon={<Info className="w-5 h-5" />}
              title="Mode Changed"
              message="Click 'Send Request' to see the difference in network traffic."
              dismissible
              onDismiss={() => setShowModeChangeBanner(false)}
            />
          </div>
        )}

        <ControlPanel
          protocolMode={protocolMode}
          vpnMode={vpnMode}
          autoPlay={autoPlay}
          stepMode={stepMode}
          onProtocolChange={(value: ProtocolMode) => handleModeChange("protocol", value)}
          onVpnChange={(value: VpnMode) => handleModeChange("vpn", value)}
          onAutoPlayChange={setAutoPlay}
          onStepModeChange={setStepMode}
          className="mb-8"
        />

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12">
          {stepMode && timelineStage !== "idle" && timelineStage !== "complete" ? (
            <Button
              size="lg"
              onClick={handleNextStep}
              className="px-8 py-6 text-lg"
              data-testid="button-next-step"
            >
              <ChevronRight className="w-5 h-5 mr-2" />
              Next Step
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
              Send Request
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
            Replay Timeline
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6 md:p-8 relative overflow-visible">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground" data-testid="text-user-view-title">
                  User View
                </h2>
                <p className="text-sm text-muted-foreground">
                  What you see when logging in
                </p>
              </div>
            </div>
            <DemoLoginForm 
              payload={DEMO_PAYLOAD}
              protocolMode={protocolMode}
            />
          </Card>

          <Card className="p-6 md:p-8 relative overflow-visible">
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
                  Wire View
                </h2>
                <p className="text-sm text-muted-foreground">
                  What the network can observe
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
              payload={DEMO_PAYLOAD}
              expandedNodes={expandedNodes}
              onToggleNode={toggleNodeExpansion}
              stepMode={stepMode}
            />

            <WireView
              stage={timelineStage}
              protocolMode={protocolMode}
              vpnMode={vpnMode}
              payload={DEMO_PAYLOAD}
              expandedNodes={expandedNodes}
              onToggleNode={toggleNodeExpansion}
            />
          </Card>
        </div>

        <footer className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            This is a simulation. No real network traffic is generated.
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Badge variant="secondary">
                    <Shield className="w-3 h-3 mr-1" />
                    Zero-Risk Learning
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Everything you see is fictional but realistic. No actual network data is captured or transmitted.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Badge variant="secondary">
                    <EyeOff className="w-3 h-3 mr-1" />
                    No Telemetry
                  </Badge>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>This application does not collect any data about your usage or send information to external servers.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </footer>
      </div>
    </div>
  );
}
