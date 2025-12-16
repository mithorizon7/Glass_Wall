import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Lock, Eye, EyeOff, AlertTriangle, ShieldCheck, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TimelineStage, ProtocolMode, VpnMode, DemoPayload } from "@/pages/glass-wall";

interface WireViewProps {
  stage: TimelineStage;
  protocolMode: ProtocolMode;
  vpnMode: VpnMode;
  payload: DemoPayload;
  expandedNodes: Set<string>;
  onToggleNode: (nodeId: string) => void;
}

function generateCiphertext(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const CIPHERTEXT_BLOCKS = {
  headers: generateCiphertext(48),
  body: generateCiphertext(64),
  response: generateCiphertext(32),
};

export function WireView({
  stage,
  protocolMode,
  vpnMode,
  payload,
  expandedNodes,
  onToggleNode,
}: WireViewProps) {
  const { t } = useTranslation("glassWall");
  const isSecure = protocolMode === "https";
  const showHandshake = isSecure && (stage === "handshake" || stage === "request" || stage === "response" || stage === "complete");
  const showRequest = stage === "request" || stage === "response" || stage === "complete";
  const showResponse = stage === "response" || stage === "complete";

  const visibleMetadata = useMemo(() => ({
    destination: payload.domain,
    connectionType: vpnMode === "on" ? t("metadata.connectionVpn") : t("metadata.connectionDirect"),
    tlsVersion: isSecure ? "TLS 1.3" : t("metadata.encryptionNone"),
  }), [payload.domain, vpnMode, isSecure, t]);

  if (stage === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          {t("wireView.readyToObserve")}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t("wireView.readyToObserveHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <Collapsible
        open={expandedNodes.has("metadata")}
        onOpenChange={() => onToggleNode("metadata")}
      >
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            className="w-full justify-between p-4 h-auto"
            data-testid="button-expand-metadata"
          >
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{t("metadata.title")}</Badge>
              <span className="text-sm text-muted-foreground">
                {t("metadata.alwaysVisible")}
              </span>
            </div>
            {expandedNodes.has("metadata") ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="bg-muted/30 rounded-lg p-4 font-mono text-sm space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">{t("metadata.destination")}:</span>
                <span className="text-foreground">{visibleMetadata.destination}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">{t("metadata.connection")}:</span>
                <span className={vpnMode === "on" ? "text-[hsl(var(--vpn-tunnel))]" : "text-foreground"}>
                  {visibleMetadata.connectionType}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">{t("metadata.encryption")}:</span>
                <span className={isSecure ? "text-[hsl(var(--https-success))]" : "text-[hsl(var(--http-danger))]"}>
                  {visibleMetadata.tlsVersion}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              {t("metadata.metadataNote")}
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {showHandshake && (
        <Collapsible
          open={expandedNodes.has("handshake")}
          onOpenChange={() => onToggleNode("handshake")}
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto"
              data-testid="button-expand-handshake"
            >
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline"
                  className="border-[hsl(var(--https-success))] text-[hsl(var(--https-success))]"
                >
                  {t("handshake.title")}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
                      {t("handshake.encryptionEstablished")}
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t("handshake.tooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {expandedNodes.has("handshake") ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 animate-fade-in">
              <div className="bg-[hsl(var(--https-success))]/5 border border-[hsl(var(--https-success))]/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-[hsl(var(--https-success))]">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="font-medium">{t("handshake.handshakeComplete")}</span>
                </div>
                <div className="font-mono text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">1.</span>
                    <span>{t("handshake.step1")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">2.</span>
                    <span>{t("handshake.step2")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">3.</span>
                    <span>{t("handshake.step3")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">4.</span>
                    <span>{t("handshake.step4")}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  {t("handshake.observersNote")}
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {showRequest && (
        <Collapsible
          open={expandedNodes.has("request")}
          onOpenChange={() => onToggleNode("request")}
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto"
              data-testid="button-expand-request"
            >
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline"
                      className={`cursor-help ${isSecure 
                        ? "border-[hsl(var(--https-success))] text-[hsl(var(--https-success))]" 
                        : "border-[hsl(var(--http-danger))] text-[hsl(var(--http-danger))]"
                      }`}
                    >
                      {t("request.title")}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t("request.tooltip")}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground cursor-help flex items-center gap-1">
                      {isSecure ? t("request.encryptedPayload") : t("request.plainTextVisible")}
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{isSecure 
                      ? t("request.tooltipEncrypted")
                      : t("request.tooltipPlainText")
                    }</p>
                  </TooltipContent>
                </Tooltip>
                {!isSecure && (
                  <AlertTriangle className="w-4 h-4 text-[hsl(var(--http-danger))]" />
                )}
              </div>
              {expandedNodes.has("request") ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 animate-fade-in">
              {isSecure ? (
                <div className="space-y-3">
                  <div className="bg-muted/30 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                      <div className="flex items-center gap-2 text-[hsl(var(--https-success))]">
                        <Lock className="w-5 h-5" />
                        <span className="font-medium">{t("request.encryptedPayload")}</span>
                      </div>
                    </div>
                    <pre className="font-mono text-xs text-muted-foreground opacity-50 blur-[2px] select-none">
{`POST /login HTTP/1.1
Content-Type: application/json

{
  "username": "${payload.body.username}",
  "password": "${payload.body.password}"
}`}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground italic flex items-center gap-2">
                    <EyeOff className="w-3 h-3" />
                    {t("request.encryptedNote")}
                  </p>
                  <p className="text-xs text-muted-foreground/70 italic">
                    {t("request.ciphertextDisclaimer")}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-[hsl(var(--http-danger))]/5 border border-[hsl(var(--http-danger))]/20 rounded-lg p-4">
                    <pre className="font-mono text-xs text-foreground whitespace-pre-wrap" data-testid="text-request-body">
{`POST /login HTTP/1.1
Host: ${payload.domain}
Content-Type: ${payload.headers["Content-Type"]}
User-Agent: ${payload.headers["User-Agent"]}

{
  "username": "${payload.body.username}",
  "password": "${payload.body.password}"
}`}
                    </pre>
                  </div>
                  <p className="text-xs text-[hsl(var(--http-danger))] italic flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    {t("request.plainTextWarning")}
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {showResponse && (
        <Collapsible
          open={expandedNodes.has("response")}
          onOpenChange={() => onToggleNode("response")}
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto"
              data-testid="button-expand-response"
            >
              <div className="flex items-center gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline"
                      className={`cursor-help ${isSecure 
                        ? "border-[hsl(var(--https-success))] text-[hsl(var(--https-success))]" 
                        : "border-[hsl(var(--http-danger))] text-[hsl(var(--http-danger))]"
                      }`}
                    >
                      {t("response.title")}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{t("response.tooltip")}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground cursor-help flex items-center gap-1">
                      {isSecure ? t("response.encryptedResponse") : t("response.plainTextResponse")}
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{isSecure 
                      ? t("response.tooltipEncrypted")
                      : t("response.tooltipPlainText")
                    }</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {expandedNodes.has("response") ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 animate-fade-in">
              {isSecure ? (
                <div className="space-y-3">
                  <div className="bg-muted/30 rounded-lg p-4 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                      <div className="flex items-center gap-2 text-[hsl(var(--https-success))]">
                        <Lock className="w-5 h-5" />
                        <span className="font-medium">{t("response.encryptedResponse")}</span>
                      </div>
                    </div>
                    <pre className="font-mono text-xs text-muted-foreground opacity-50 blur-[2px] select-none">
{`HTTP/1.1 200 OK
Set-Cookie: session=abc123xyz

{ "success": true, "token": "jwt..." }`}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-[hsl(var(--http-danger))]/5 border border-[hsl(var(--http-danger))]/20 rounded-lg p-4">
                    <pre className="font-mono text-xs text-foreground whitespace-pre-wrap" data-testid="text-response-body">
{`HTTP/1.1 200 OK
Set-Cookie: session=abc123xyz789def
Content-Type: application/json

{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}`}
                    </pre>
                  </div>
                  <p className="text-xs text-[hsl(var(--http-danger))] italic flex items-center gap-2">
                    <Eye className="w-3 h-3" />
                    {t("response.sessionWarning")}
                  </p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {stage === "complete" && (
        <div 
          className={`mt-4 p-4 rounded-lg border ${
            isSecure 
              ? "bg-[hsl(var(--https-success))]/10 border-[hsl(var(--https-success))]/30" 
              : "bg-[hsl(var(--http-danger))]/10 border-[hsl(var(--http-danger))]/30"
          }`}
          data-testid="container-summary"
        >
          <h4 className={`font-semibold mb-2 ${
            isSecure ? "text-[hsl(var(--https-success))]" : "text-[hsl(var(--http-danger))]"
          }`}>
            {isSecure ? t("summary.protectedTitle") : t("summary.exposedTitle")}
          </h4>
          <p className="text-sm text-muted-foreground">
            {isSecure 
              ? t("summary.protectedMessage")
              : t("summary.exposedMessage")
            }
          </p>
        </div>
      )}
    </div>
  );
}
