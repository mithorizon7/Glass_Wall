import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Trans } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  CheckCircle, 
  Circle, 
  Trophy,
  ChevronDown,
  RotateCcw,
  Lock,
  Unlock,
  Shield,
  ShieldOff,
} from "lucide-react";

const STORAGE_KEY = "glass-wall-progress";

interface ProgressState {
  httpExplored: boolean;
  httpsExplored: boolean;
  vpnOffExplored: boolean;
  vpnOnExplored: boolean;
  httpVpnOff: boolean;
  httpVpnOn: boolean;
  httpsVpnOff: boolean;
  httpsVpnOn: boolean;
}

const DEFAULT_PROGRESS: ProgressState = {
  httpExplored: false,
  httpsExplored: false,
  vpnOffExplored: false,
  vpnOnExplored: false,
  httpVpnOff: false,
  httpVpnOn: false,
  httpsVpnOff: false,
  httpsVpnOn: false,
};

interface ProgressTrackerProps {
  currentProtocol: "http" | "https";
  currentVpn: "off" | "on";
  timelineComplete: boolean;
  className?: string;
}

export function ProgressTracker({ 
  currentProtocol, 
  currentVpn, 
  timelineComplete,
  className = "" 
}: ProgressTrackerProps) {
  const { t } = useTranslation("glassWall");
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setProgress(JSON.parse(stored));
      } catch {
        setProgress(DEFAULT_PROGRESS);
      }
    }
  }, []);

  useEffect(() => {
    if (timelineComplete) {
      setProgress(prev => {
        const updated = { ...prev };
        
        if (currentProtocol === "http") {
          updated.httpExplored = true;
        } else {
          updated.httpsExplored = true;
        }
        
        if (currentVpn === "off") {
          updated.vpnOffExplored = true;
        } else {
          updated.vpnOnExplored = true;
        }
        
        const comboKey = `${currentProtocol}Vpn${currentVpn === "off" ? "Off" : "On"}` as keyof ProgressState;
        updated[comboKey] = true;
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [timelineComplete, currentProtocol, currentVpn]);

  const handleReset = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const completedCount = [
    progress.httpVpnOff,
    progress.httpVpnOn,
    progress.httpsVpnOff,
    progress.httpsVpnOn,
  ].filter(Boolean).length;

  const progressPercent = (completedCount / 4) * 100;
  const allComplete = completedCount === 4;

  const combinations = [
    { 
      key: "httpVpnOff", 
      label: t("progressTracker.httpWithoutVpn"), 
      done: progress.httpVpnOff,
      protocolIcon: Unlock,
      vpnIcon: ShieldOff,
      protocolColor: "text-red-500",
      description: t("progressTracker.mostVulnerable")
    },
    { 
      key: "httpVpnOn", 
      label: t("progressTracker.httpWithVpn"), 
      done: progress.httpVpnOn,
      protocolIcon: Unlock,
      vpnIcon: Shield,
      protocolColor: "text-red-500",
      description: t("progressTracker.contentVisibleToVpn")
    },
    { 
      key: "httpsVpnOff", 
      label: t("progressTracker.httpsWithoutVpn"), 
      done: progress.httpsVpnOff,
      protocolIcon: Lock,
      vpnIcon: ShieldOff,
      protocolColor: "text-green-500",
      description: t("progressTracker.contentEncryptedMetadataVisible")
    },
    { 
      key: "httpsVpnOn", 
      label: t("progressTracker.httpsWithVpn"), 
      done: progress.httpsVpnOn,
      protocolIcon: Lock,
      vpnIcon: Shield,
      protocolColor: "text-green-500",
      description: t("progressTracker.maximumProtection")
    },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`p-4 ${className}`}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full flex items-center justify-between gap-2 p-0 h-auto"
            data-testid="button-toggle-progress"
          >
            <div className="flex items-center gap-2">
              {allComplete ? (
                <Trophy className="w-5 h-5 text-amber-500" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground" />
              )}
              <span className="font-semibold text-foreground">
                {t("progressTracker.title")}
              </span>
              <Badge variant="secondary" className="text-xs">
                {completedCount}/4
              </Badge>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} 
            />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("common:plurals.ofTotal", { count: completedCount, total: 4 })} {t("progressTracker.modesExplored")}
                </span>
                <span className="font-medium text-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" data-testid="progress-bar" />
            </div>

            {allComplete && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
                <Trophy className="w-5 h-5 text-amber-500" />
                <p className="text-sm text-foreground font-medium">
                  {t("progressTracker.congratulations")}
                </p>
              </div>
            )}

            <div className="space-y-2">
              {combinations.map((combo) => {
                const ProtocolIcon = combo.protocolIcon;
                const VpnIcon = combo.vpnIcon;
                
                return (
                  <div 
                    key={combo.key}
                    className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                      combo.done ? "bg-muted/50" : ""
                    }`}
                    data-testid={`progress-item-${combo.key}`}
                  >
                    {combo.done ? (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ProtocolIcon className={`w-4 h-4 ${combo.protocolColor} flex-shrink-0`} />
                      <VpnIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${combo.done ? "text-foreground" : "text-muted-foreground"}`}>
                          {combo.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleReset}
              className="w-full text-muted-foreground"
              data-testid="button-reset-progress"
            >
              <RotateCcw className="w-3 h-3 mr-2" />
              {t("progressTracker.resetProgress")}
            </Button>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
