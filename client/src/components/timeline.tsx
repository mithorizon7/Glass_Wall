import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Globe, 
  Upload, 
  Download, 
  CheckCircle2, 
  Circle,
  ArrowRight,
  Server,
  Shield,
  Wifi,
  Lock,
} from "lucide-react";
import type { TimelineStage, ProtocolMode, VpnMode, DemoPayload } from "@/pages/glass-wall";

interface TimelineProps {
  stage: TimelineStage;
  protocolMode: ProtocolMode;
  vpnMode: VpnMode;
  payload: DemoPayload;
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
  stepMode: boolean;
}

interface TimelineNode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tooltipContent: string;
}

export function Timeline({
  stage,
  protocolMode,
  vpnMode,
  payload,
  expandedNodes,
  onToggleNode,
  stepMode,
}: TimelineProps) {
  const { t } = useTranslation("glassWall");

  const nodes: TimelineNode[] = useMemo(() => {
    const baseNodes: TimelineNode[] = [
      {
        id: "connect",
        title: t("timeline.connect"),
        description: vpnMode === "on" 
          ? t("timeline.connectDescVpn")
          : t("timeline.connectDescDirect"),
        icon: <Globe className="w-5 h-5" />,
        tooltipContent: vpnMode === "on"
          ? t("timeline.connectTooltipVpn")
          : t("timeline.connectTooltipDirect"),
      },
    ];

    if (protocolMode === "https") {
      baseNodes.push({
        id: "handshake",
        title: t("timeline.handshake"),
        description: t("timeline.handshakeDesc"),
        icon: <Lock className="w-5 h-5" />,
        tooltipContent: t("timeline.handshakeTooltip"),
      });
    }

    baseNodes.push(
      {
        id: "request",
        title: t("timeline.request"),
        description: t("timeline.requestDesc"),
        icon: <Upload className="w-5 h-5" />,
        tooltipContent: protocolMode === "https"
          ? t("timeline.requestTooltipSecure")
          : t("timeline.requestTooltipInsecure"),
      },
      {
        id: "response",
        title: t("timeline.response"),
        description: t("timeline.responseDesc"),
        icon: <Download className="w-5 h-5" />,
        tooltipContent: protocolMode === "https"
          ? t("timeline.responseTooltipSecure")
          : t("timeline.responseTooltipInsecure"),
      }
    );

    return baseNodes;
  }, [protocolMode, vpnMode, t]);

  const getNodeState = (nodeId: string): "inactive" | "active" | "complete" => {
    const stageOrder = protocolMode === "https" 
      ? ["idle", "connect", "handshake", "request", "response", "complete"]
      : ["idle", "connect", "request", "response", "complete"];
    const currentIndex = stageOrder.indexOf(stage);
    const nodeIndex = stageOrder.indexOf(nodeId);
    
    if (stage === "complete") return "complete";
    if (nodeIndex < currentIndex) return "complete";
    if (nodeIndex === currentIndex) return "active";
    return "inactive";
  };

  const stageColors = useMemo(() => ({
    inactive: "border-muted bg-muted/30 text-muted-foreground",
    active: protocolMode === "https"
      ? "border-[hsl(var(--https-success))] bg-[hsl(var(--https-success))]/10 text-[hsl(var(--https-success))] animate-pulse-node"
      : "border-[hsl(var(--http-danger))] bg-[hsl(var(--http-danger))]/10 text-[hsl(var(--http-danger))] animate-pulse-node",
    complete: protocolMode === "https"
      ? "border-[hsl(var(--https-success))] bg-[hsl(var(--https-success))] text-white"
      : "border-[hsl(var(--http-danger))] bg-[hsl(var(--http-danger))] text-white",
  }), [protocolMode]);

  const lineColor = useMemo(() => {
    return protocolMode === "https"
      ? "bg-[hsl(var(--https-success))]"
      : "bg-[hsl(var(--http-danger))]";
  }, [protocolMode]);

  return (
    <div className="mb-6">
      {vpnMode === "on" && (
        <div className="flex items-center justify-center gap-2 mb-6 py-3 px-4 rounded-lg bg-[hsl(var(--vpn-tunnel))]/10 border border-[hsl(var(--vpn-tunnel))]/30">
          <Wifi className="w-4 h-4 text-[hsl(var(--vpn-tunnel))]" />
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <Shield className="w-4 h-4 text-[hsl(var(--vpn-tunnel))]" />
          <span className="text-sm font-medium text-[hsl(var(--vpn-tunnel))]">{t("timeline.vpnTunnel")}</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <Server className="w-4 h-4 text-[hsl(var(--vpn-tunnel))]" />
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <Globe className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {nodes.map((node, index) => {
          const state = getNodeState(node.id);
          const showLine = index < nodes.length - 1;
          const prevNodeState = index > 0 ? getNodeState(nodes[index - 1].id) : "inactive";
          
          return (
            <div key={node.id} className="flex items-center flex-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex flex-col items-center cursor-help"
                    data-testid={`timeline-node-${node.id}`}
                  >
                    <div 
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${stageColors[state]}`}
                    >
                      {state === "complete" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        node.icon
                      )}
                    </div>
                    <span className={`text-sm font-medium mt-2 ${
                      state === "inactive" ? "text-muted-foreground" : "text-foreground"
                    }`}>
                      {node.title}
                    </span>
                    <span className="text-xs text-muted-foreground text-center max-w-[100px] hidden sm:block">
                      {node.description}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{node.tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
              
              {showLine && (
                <div className="flex-1 h-0.5 mx-2 bg-muted relative overflow-hidden">
                  {(state === "complete" || state === "active") && (
                    <div 
                      className={`absolute inset-y-0 left-0 ${lineColor} transition-all duration-700 ${
                        state === "complete" ? "w-full" : "w-1/2"
                      }`}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
