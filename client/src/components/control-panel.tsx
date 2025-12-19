import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lock, Unlock, Shield, ShieldOff, Info } from "lucide-react";
import type { ProtocolMode, VpnMode } from "@/pages/glass-wall";

interface ControlPanelProps {
  protocolMode: ProtocolMode;
  vpnMode: VpnMode;
  onProtocolChange: (value: ProtocolMode) => void;
  onVpnChange: (value: VpnMode) => void;
  className?: string;
}

export function ControlPanel({
  protocolMode,
  vpnMode,
  onProtocolChange,
  onVpnChange,
  className = "",
}: ControlPanelProps) {
  const { t } = useTranslation("glassWall");
  const { t: tc } = useTranslation("common");
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>
      <Card className="p-4" data-onboarding="protocol-toggle">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            {t("controls.protocol")}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t("controls.protocolTooltip")}</p>
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

      <Card className="p-4" data-onboarding="vpn-toggle">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            {t("controls.vpn")}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t("controls.vpnTooltip")}</p>
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
    </div>
  );
}
