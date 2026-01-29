import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Globe,
  Upload,
  Download,
  CheckCircle2,
  ArrowRight,
  Server,
  Shield,
  Wifi,
  Lock,
  ChevronRight,
} from "lucide-react";
import type {
  TimelineStage,
  ProtocolMode,
  VpnMode,
  DemoPayload,
  AttackerModel,
} from "@/pages/glass-wall";

interface TimelineProps {
  stage: TimelineStage;
  protocolMode: ProtocolMode;
  vpnMode: VpnMode;
  attackerModel: AttackerModel;
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
  attackerModel,
  payload,
  expandedNodes,
  onToggleNode,
  stepMode,
}: TimelineProps) {
  const { t } = useTranslation("glassWall");
  const [isMetadataAdvancedOpen, setIsMetadataAdvancedOpen] = useState(false);
  const metadataBadgeClass =
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30";
  const contentBadgeClass =
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30";

  const nodes: TimelineNode[] = useMemo(() => {
    const baseNodes: TimelineNode[] = [
      {
        id: "connect",
        title: t("timeline.connect"),
        description:
          vpnMode === "on" ? t("timeline.connectDescVpn") : t("timeline.connectDescDirect"),
        icon: <Globe className="w-5 h-5" />,
        tooltipContent:
          vpnMode === "on" ? t("timeline.connectTooltipVpn") : t("timeline.connectTooltipDirect"),
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
        tooltipContent:
          protocolMode === "https"
            ? t("timeline.requestTooltipSecure")
            : t("timeline.requestTooltipInsecure"),
      },
      {
        id: "response",
        title: t("timeline.response"),
        description: t("timeline.responseDesc"),
        icon: <Download className="w-5 h-5" />,
        tooltipContent:
          protocolMode === "https"
            ? t("timeline.responseTooltipSecure")
            : t("timeline.responseTooltipInsecure"),
      },
    );

    return baseNodes;
  }, [protocolMode, vpnMode, t]);

  const getNodeState = (nodeId: string): "inactive" | "active" | "complete" => {
    const stageOrder =
      protocolMode === "https"
        ? ["idle", "connect", "handshake", "request", "response", "complete"]
        : ["idle", "connect", "request", "response", "complete"];
    const currentIndex = stageOrder.indexOf(stage);
    const nodeIndex = stageOrder.indexOf(nodeId);

    if (stage === "complete") return "complete";
    if (nodeIndex < currentIndex) return "complete";
    if (nodeIndex === currentIndex) return "active";
    return "inactive";
  };

  const stageColors = useMemo(
    () => ({
      inactive: "border-muted bg-muted/30 text-muted-foreground",
      active:
        protocolMode === "https"
          ? "border-[hsl(var(--https-success))] bg-[hsl(var(--https-success))]/10 text-[hsl(var(--https-success))] animate-pulse-node"
          : "border-[hsl(var(--http-danger))] bg-[hsl(var(--http-danger))]/10 text-[hsl(var(--http-danger))] animate-pulse-node",
      complete:
        protocolMode === "https"
          ? "border-[hsl(var(--https-success))] bg-[hsl(var(--https-success))] text-white"
          : "border-[hsl(var(--http-danger))] bg-[hsl(var(--http-danger))] text-white",
    }),
    [protocolMode],
  );

  const lineColor = useMemo(() => {
    return protocolMode === "https"
      ? "bg-[hsl(var(--https-success))]"
      : "bg-[hsl(var(--http-danger))]";
  }, [protocolMode]);

  const getAttackerNote = useCallback(
    (sectionId: string) => {
      if (sectionId === "metadata") {
        return t(`timeline.attackerNotes.metadata.${attackerModel}`);
      }
      if (sectionId === "handshake") {
        return t(`timeline.attackerNotes.handshake.${attackerModel}`);
      }
      if (sectionId === "request") {
        return t(
          `timeline.attackerNotes.request.${attackerModel}.${protocolMode === "https" ? "secure" : "plain"}`,
        );
      }
      if (sectionId === "response") {
        return t(
          `timeline.attackerNotes.response.${attackerModel}.${protocolMode === "https" ? "secure" : "plain"}`,
        );
      }
      return "";
    },
    [attackerModel, protocolMode, t],
  );

  const detailSections = useMemo(() => {
    const encryptionValue =
      protocolMode === "https" ? t("metadata.encryptionTls") : t("metadata.encryptionNone");

    const advancedItems = t("metadata.advancedItems", { returnObjects: true }) as string[];

    const metadataContent = (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
            {t("metadata.alwaysVisible")}
          </Badge>
          <Badge className={`text-[10px] uppercase tracking-wide ${metadataBadgeClass}`}>
            {t("labels.metadata")}
          </Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("metadata.destination")}</p>
            <p className="font-medium text-foreground">{payload.domain}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("metadata.connection")}</p>
            <p className="font-medium text-foreground">
              {vpnMode === "on" ? t("metadata.connectionVpn") : t("metadata.connectionDirect")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("metadata.encryption")}</p>
            <p className="font-medium text-foreground">{encryptionValue}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("metadata.metadataNote")}
        </p>
        <Collapsible open={isMetadataAdvancedOpen} onOpenChange={setIsMetadataAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="px-0 h-auto text-xs text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <ChevronRight
                  className={`w-3 h-3 transition-transform ${isMetadataAdvancedOpen ? "rotate-90" : ""}`}
                />
                {t("metadata.advancedPrompt")}
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
            <p className="mb-2">{t("metadata.advancedSkip")}</p>
            <ul className="list-disc pl-5 space-y-1">
              {Array.isArray(advancedItems) &&
                advancedItems.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );

    const handshakeContent = (
      <div className="space-y-3 text-sm">
        <p className="font-medium text-foreground">{t("handshake.handshakeComplete")}</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>{t("handshake.step1")}</li>
          <li>{t("handshake.step2")}</li>
          <li>{t("handshake.step3")}</li>
          <li>{t("handshake.step4")}</li>
        </ul>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("handshake.observersNote")}
        </p>
      </div>
    );

    const requestContent = (
      <div className="space-y-3 text-sm">
        <Badge className={`w-fit text-[10px] uppercase tracking-wide ${contentBadgeClass}`}>
          {t("labels.content")}
        </Badge>
        <div className="font-mono text-xs bg-muted/50 rounded p-3">
          <div className="text-muted-foreground">
            {t("wireView.requestLine", { method: payload.method, path: payload.path })}
          </div>
          <div className="text-muted-foreground">
            {t("wireView.hostHeader")} {payload.domain}
          </div>
        </div>
        {protocolMode === "https" ? (
          <div className="space-y-1 text-muted-foreground">
            <p>{t("request.encryptedNote")}</p>
            <p className="text-xs">{t("request.ciphertextDisclaimer")}</p>
          </div>
        ) : (
          <p className="text-[hsl(var(--http-danger))] font-medium">
            {t("request.plainTextWarning")}
          </p>
        )}
      </div>
    );

    const responseContent = (
      <div className="space-y-3 text-sm">
        <Badge className={`w-fit text-[10px] uppercase tracking-wide ${contentBadgeClass}`}>
          {t("labels.content")}
        </Badge>
        <div className="font-mono text-xs bg-muted/50 rounded p-3">
          {protocolMode === "https" ? (
            <span className="text-[hsl(var(--https-success))]">
              {t("response.encryptedResponse")}
            </span>
          ) : (
            <span className="text-[hsl(var(--http-danger))]">
              {t("response.plainTextResponse")}
            </span>
          )}
        </div>
        {protocolMode === "https" ? (
          <p className="text-muted-foreground">{t("response.tooltipEncrypted")}</p>
        ) : (
          <p className="text-[hsl(var(--http-danger))] font-medium">
            {t("response.sessionWarning")}
          </p>
        )}
      </div>
    );

    const sections = [
      { id: "metadata", title: t("metadata.title"), content: metadataContent },
      ...(protocolMode === "https"
        ? [{ id: "handshake", title: t("handshake.title"), content: handshakeContent }]
        : []),
      { id: "request", title: t("request.title"), content: requestContent },
      { id: "response", title: t("response.title"), content: responseContent },
    ];

    return sections;
  }, [
    isMetadataAdvancedOpen,
    payload.domain,
    payload.method,
    payload.path,
    protocolMode,
    t,
    vpnMode,
  ]);

  return (
    <div className="mb-6 space-y-6">
      {vpnMode === "on" && (
        <div className="flex items-center justify-center gap-2 mb-6 py-3 px-4 rounded-lg bg-[hsl(var(--vpn-tunnel))]/10 border border-[hsl(var(--vpn-tunnel))]/30">
          <Wifi className="w-4 h-4 text-[hsl(var(--vpn-tunnel))]" />
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <Shield className="w-4 h-4 text-[hsl(var(--vpn-tunnel))]" />
          <span className="text-sm font-medium text-[hsl(var(--vpn-tunnel))]">
            {t("timeline.vpnTunnel")}
          </span>
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <Server className="w-4 h-4 text-[hsl(var(--vpn-tunnel))]" />
          <ArrowRight className="w-3 h-3 text-muted-foreground" />
          <Globe className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4">
        <span>{t("labels.legendTitle")}</span>
        <Badge className={`text-[10px] uppercase tracking-wide ${metadataBadgeClass}`}>
          {t("labels.metadata")}
        </Badge>
        <Badge className={`text-[10px] uppercase tracking-wide ${contentBadgeClass}`}>
          {t("labels.content")}
        </Badge>
      </div>

      <div className="flex items-center justify-between gap-2">
        {nodes.map((node, index) => {
          const state = getNodeState(node.id);
          const showLine = index < nodes.length - 1;

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
                      {state === "complete" ? <CheckCircle2 className="w-5 h-5" /> : node.icon}
                    </div>
                    <span
                      className={`text-sm font-medium mt-2 ${
                        state === "inactive" ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
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

      <div className="space-y-3">
        {detailSections.map((section) => {
          const isExpanded = expandedNodes.has(section.id);
          const isActive =
            section.id === "metadata" ? stage !== "idle" : getNodeState(section.id) !== "inactive";
          const isDisabled = stepMode && stage === "idle" && section.id !== "metadata";
          const attackerNote = getAttackerNote(section.id);

          return (
            <div
              key={section.id}
              className={`rounded-lg border transition-colors ${
                isActive ? "border-border bg-background" : "border-muted bg-muted/30"
              }`}
            >
              <Button
                type="button"
                variant="ghost"
                className={`w-full justify-between px-4 py-3 h-auto ${isDisabled ? "opacity-60" : ""}`}
                onClick={() => onToggleNode(section.id)}
                disabled={isDisabled}
                aria-expanded={isExpanded}
                aria-label={t("timeline.toggleDetails", { section: section.title })}
                data-testid={`button-toggle-${section.id}`}
              >
                <span className="text-sm font-medium text-foreground">{section.title}</span>
                <ChevronRight
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                />
              </Button>
              {isExpanded && (
                <div className="px-4 pb-4">
                  {section.content}
                  {attackerNote && (
                    <div className="mt-3 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">
                        {t("timeline.attackerNoteTitle")}
                      </p>
                      <p className="opacity-80 leading-relaxed">{attackerNote}</p>
                    </div>
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
