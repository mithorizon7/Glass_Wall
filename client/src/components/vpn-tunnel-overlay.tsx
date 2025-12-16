import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";

export function VpnTunnelOverlay() {
  const { t } = useTranslation("glassWall");

  return (
    <div 
      className="absolute inset-[-4px] pointer-events-none z-10 rounded-xl"
      data-testid="overlay-vpn-tunnel"
    >
      <div 
        className="absolute inset-0 border-2 border-dashed border-[hsl(var(--vpn-tunnel))] rounded-xl animate-pulse"
        style={{
          background: "linear-gradient(135deg, hsl(var(--vpn-tunnel) / 0.08) 0%, hsl(var(--vpn-tunnel) / 0.02) 50%, hsl(var(--vpn-tunnel) / 0.08) 100%)",
          boxShadow: "inset 0 0 20px hsl(var(--vpn-tunnel) / 0.1), 0 0 15px hsl(var(--vpn-tunnel) / 0.15)",
        }}
      />
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-background px-4 py-1.5 rounded-full border-2 border-[hsl(var(--vpn-tunnel))] flex items-center gap-2 shadow-lg">
        <Shield className="w-4 h-4 text-[hsl(var(--vpn-tunnel))]" />
        <span className="text-sm font-semibold text-[hsl(var(--vpn-tunnel))]" data-testid="text-vpn-active">
          {t("vpnTunnelOverlay.active")}
        </span>
      </div>
    </div>
  );
}
