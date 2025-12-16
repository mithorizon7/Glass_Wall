import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Unlock, Shield, ShieldOff, Repeat, ListOrdered, Info } from "lucide-react";
import type { ProtocolMode, VpnMode } from "@/pages/glass-wall";

interface ControlPanelProps {
  protocolMode: ProtocolMode;
  vpnMode: VpnMode;
  autoPlay: boolean;
  stepMode: boolean;
  onProtocolChange: (value: ProtocolMode) => void;
  onVpnChange: (value: VpnMode) => void;
  onAutoPlayChange: (value: boolean) => void;
  onStepModeChange: (value: boolean) => void;
  className?: string;
}

export function ControlPanel({
  protocolMode,
  vpnMode,
  autoPlay,
  stepMode,
  onProtocolChange,
  onVpnChange,
  onAutoPlayChange,
  onStepModeChange,
  className = "",
}: ControlPanelProps) {
  const { t } = useTranslation("glassWall");
  const { t: tc } = useTranslation("common");
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            {t("controls.protocol")}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>HTTP sends data in plain text. HTTPS encrypts your data so observers can't read it.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onProtocolChange("http")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
              protocolMode === "http"
                ? "bg-[hsl(var(--http-danger))]/10 border-[hsl(var(--http-danger))] text-[hsl(var(--http-danger))]"
                : "border-border text-muted-foreground hover-elevate"
            }`}
            data-testid="button-protocol-http"
          >
            <Unlock className="w-4 h-4" />
            <span className="font-medium">HTTP</span>
          </button>
          <button
            onClick={() => onProtocolChange("https")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
              protocolMode === "https"
                ? "bg-[hsl(var(--https-success))]/10 border-[hsl(var(--https-success))] text-[hsl(var(--https-success))]"
                : "border-border text-muted-foreground hover-elevate"
            }`}
            data-testid="button-protocol-https"
          >
            <Lock className="w-4 h-4" />
            <span className="font-medium">HTTPS</span>
          </button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            {t("controls.vpn")}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>A VPN creates an encrypted tunnel. It shifts trust to the VPN provider but doesn't make you invincible.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onVpnChange("off")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
              vpnMode === "off"
                ? "bg-muted border-border text-foreground"
                : "border-border text-muted-foreground hover-elevate"
            }`}
            data-testid="button-vpn-off"
          >
            <ShieldOff className="w-4 h-4" />
            <span className="font-medium">{tc("off")}</span>
          </button>
          <button
            onClick={() => onVpnChange("on")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
              vpnMode === "on"
                ? "bg-[hsl(var(--vpn-tunnel))]/10 border-[hsl(var(--vpn-tunnel))] text-[hsl(var(--vpn-tunnel))]"
                : "border-border text-muted-foreground hover-elevate"
            }`}
            data-testid="button-vpn-on"
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">{tc("on")}</span>
          </button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Label htmlFor="auto-play" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            {t("controls.autoPlay")}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Automatically replay the timeline when you switch modes.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
        </div>
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-2">
            <Repeat className={`w-4 h-4 ${autoPlay ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`font-medium ${autoPlay ? "text-foreground" : "text-muted-foreground"}`}>
              {autoPlay ? tc("enabled") : tc("disabled")}
            </span>
          </div>
          <Switch
            id="auto-play"
            checked={autoPlay}
            onCheckedChange={onAutoPlayChange}
            data-testid="switch-auto-play"
          />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Label htmlFor="step-mode" className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1">
            {t("controls.stepMode")}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Advance through the timeline one step at a time for detailed learning.</p>
              </TooltipContent>
            </Tooltip>
          </Label>
        </div>
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-2">
            <ListOrdered className={`w-4 h-4 ${stepMode ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`font-medium ${stepMode ? "text-foreground" : "text-muted-foreground"}`}>
              {stepMode ? tc("enabled") : tc("disabled")}
            </span>
          </div>
          <Switch
            id="step-mode"
            checked={stepMode}
            onCheckedChange={onStepModeChange}
            data-testid="switch-step-mode"
          />
        </div>
      </Card>
    </div>
  );
}
