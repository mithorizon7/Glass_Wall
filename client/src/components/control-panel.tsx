import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock, Unlock, Shield, ShieldOff, Info } from "lucide-react";
import type { ProtocolMode, VpnMode, AttackerModel } from "@/pages/glass-wall";

interface ControlPanelProps {
  protocolMode: ProtocolMode;
  vpnMode: VpnMode;
  attackerModel: AttackerModel;
  autoPlay: boolean;
  stepMode: boolean;
  onProtocolChange: (value: ProtocolMode) => void;
  onVpnChange: (value: VpnMode) => void;
  onAttackerModelChange: (value: AttackerModel) => void;
  onAutoPlayChange: (value: boolean) => void;
  onStepModeChange: (value: boolean) => void;
  className?: string;
}

export function ControlPanel({
  protocolMode,
  vpnMode,
  attackerModel,
  autoPlay,
  stepMode,
  onProtocolChange,
  onVpnChange,
  onAttackerModelChange,
  onAutoPlayChange,
  onStepModeChange,
  className = "",
}: ControlPanelProps) {
  const { t } = useTranslation("glassWall");
  const { t: tc } = useTranslation("common");

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 ${className}`}>
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
            <span className="font-medium">{t("controls.httpLabel")}</span>
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
            <span className="font-medium">{t("controls.httpsLabel")}</span>
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

      <Card className="p-4" data-onboarding="attacker-model-toggle">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            {t("controls.attackerModel")}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{t("controls.attackerModelTooltip")}</p>
              </TooltipContent>
            </Tooltip>
          </Label>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => onAttackerModelChange("passive")}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
              attackerModel === "passive"
                ? "bg-primary/10 border-primary text-primary"
                : "border-border text-muted-foreground hover-elevate"
            }`}
            data-testid="button-attacker-passive"
          >
            <span className="font-medium">{t("controls.attackerModels.passive")}</span>
          </button>
          <button
            onClick={() => onAttackerModelChange("rogueHotspot")}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
              attackerModel === "rogueHotspot"
                ? "bg-primary/10 border-primary text-primary"
                : "border-border text-muted-foreground hover-elevate"
            }`}
            data-testid="button-attacker-rogue"
          >
            <span className="font-medium">{t("controls.attackerModels.rogueHotspot")}</span>
          </button>
          <button
            onClick={() => onAttackerModelChange("compromisedEndpoint")}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-all text-left ${
              attackerModel === "compromisedEndpoint"
                ? "bg-primary/10 border-primary text-primary"
                : "border-border text-muted-foreground hover-elevate"
            }`}
            data-testid="button-attacker-compromised"
          >
            <span className="font-medium">{t("controls.attackerModels.compromisedEndpoint")}</span>
          </button>
        </div>
      </Card>

      <Card className="p-4" data-onboarding="playback-toggle">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <Label
                htmlFor="toggle-auto-play"
                className="text-xs font-medium text-muted-foreground"
              >
                {t("controls.autoPlay")}
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t("controls.autoPlayTooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              id="toggle-auto-play"
              checked={autoPlay}
              onCheckedChange={onAutoPlayChange}
              data-testid="switch-auto-play"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <Label
                htmlFor="toggle-step-mode"
                className="text-xs font-medium text-muted-foreground"
              >
                {t("controls.stepMode")}
              </Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{t("controls.stepModeTooltip")}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Switch
              id="toggle-step-mode"
              checked={stepMode}
              onCheckedChange={onStepModeChange}
              data-testid="switch-step-mode"
            />
          </div>
          {stepMode && (
            <p className="text-xs text-muted-foreground">{t("controls.stepModeHint")}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
