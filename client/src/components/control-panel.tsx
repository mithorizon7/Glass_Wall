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

interface InlineInfoTooltipProps {
  label: string;
  content: string;
}

function InlineInfoTooltip({ label, content }: InlineInfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Info className="w-3 h-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
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
      <Card className="p-5" data-onboarding="protocol-toggle">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1">
            {t("controls.protocol")}
            <InlineInfoTooltip
              label={t("controls.protocolTooltip")}
              content={t("controls.protocolTooltip")}
            />
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onProtocolChange("http")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-sm font-semibold transition-all ${
              protocolMode === "http"
                ? "bg-[hsl(var(--http-danger))]/10 border-[hsl(var(--http-danger))]/50 text-[hsl(var(--http-danger))] shadow-[inset_0_0_0_1px_hsl(var(--http-danger)/0.2)]"
                : "border-border/60 text-muted-foreground hover:bg-card/70"
            }`}
            data-testid="button-protocol-http"
          >
            <Unlock className="w-4 h-4" />
            <span className="font-medium">{t("controls.httpLabel")}</span>
          </button>
          <button
            type="button"
            onClick={() => onProtocolChange("https")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-sm font-semibold transition-all ${
              protocolMode === "https"
                ? "bg-[hsl(var(--https-success))]/10 border-[hsl(var(--https-success))]/50 text-[hsl(var(--https-success))] shadow-[inset_0_0_0_1px_hsl(var(--https-success)/0.2)]"
                : "border-border/60 text-muted-foreground hover:bg-card/70"
            }`}
            data-testid="button-protocol-https"
          >
            <Lock className="w-4 h-4" />
            <span className="font-medium">{t("controls.httpsLabel")}</span>
          </button>
        </div>
      </Card>

      <Card className="p-5" data-onboarding="vpn-toggle">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1">
            {t("controls.vpn")}
            <InlineInfoTooltip label={t("controls.vpnTooltip")} content={t("controls.vpnTooltip")} />
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onVpnChange("off")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-sm font-semibold transition-all ${
              vpnMode === "off"
                ? "bg-muted/70 border-border/70 text-foreground"
                : "border-border/60 text-muted-foreground hover:bg-card/70"
            }`}
            data-testid="button-vpn-off"
          >
            <ShieldOff className="w-4 h-4" />
            <span className="font-medium">{tc("off")}</span>
          </button>
          <button
            type="button"
            onClick={() => onVpnChange("on")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-full border text-sm font-semibold transition-all ${
              vpnMode === "on"
                ? "bg-[hsl(var(--vpn-tunnel))]/10 border-[hsl(var(--vpn-tunnel))]/50 text-[hsl(var(--vpn-tunnel))] shadow-[inset_0_0_0_1px_hsl(var(--vpn-tunnel)/0.2)]"
                : "border-border/60 text-muted-foreground hover:bg-card/70"
            }`}
            data-testid="button-vpn-on"
          >
            <Shield className="w-4 h-4" />
            <span className="font-medium">{tc("on")}</span>
          </button>
        </div>
      </Card>

      <Card className="p-5" data-onboarding="attacker-model-toggle">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-1">
            {t("controls.attackerModel")}
            <InlineInfoTooltip
              label={t("controls.attackerModelTooltip")}
              content={t("controls.attackerModelTooltip")}
            />
          </Label>
        </div>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => onAttackerModelChange("passive")}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border transition-all text-left text-sm font-semibold ${
              attackerModel === "passive"
                ? "bg-primary/10 border-primary/40 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
                : "border-border/60 text-muted-foreground hover:bg-card/70"
            }`}
            data-testid="button-attacker-passive"
          >
            <span className="font-medium">{t("controls.attackerModels.passive")}</span>
          </button>
          <button
            type="button"
            onClick={() => onAttackerModelChange("rogueHotspot")}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border transition-all text-left text-sm font-semibold ${
              attackerModel === "rogueHotspot"
                ? "bg-primary/10 border-primary/40 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
                : "border-border/60 text-muted-foreground hover:bg-card/70"
            }`}
            data-testid="button-attacker-rogue"
          >
            <span className="font-medium">{t("controls.attackerModels.rogueHotspot")}</span>
          </button>
          <button
            type="button"
            onClick={() => onAttackerModelChange("compromisedEndpoint")}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl border transition-all text-left text-sm font-semibold ${
              attackerModel === "compromisedEndpoint"
                ? "bg-primary/10 border-primary/40 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
                : "border-border/60 text-muted-foreground hover:bg-card/70"
            }`}
            data-testid="button-attacker-compromised"
          >
            <span className="font-medium">{t("controls.attackerModels.compromisedEndpoint")}</span>
          </button>
        </div>
      </Card>

      <Card className="p-5" data-onboarding="playback-toggle">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <Label
                htmlFor="toggle-auto-play"
                className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]"
              >
                {t("controls.autoPlay")}
              </Label>
              <InlineInfoTooltip
                label={t("controls.autoPlayTooltip")}
                content={t("controls.autoPlayTooltip")}
              />
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
                className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.2em]"
              >
                {t("controls.stepMode")}
              </Label>
              <InlineInfoTooltip
                label={t("controls.stepModeTooltip")}
                content={t("controls.stepModeTooltip")}
              />
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
