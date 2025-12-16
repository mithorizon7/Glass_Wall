import { useMemo } from "react";
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
  const isSecure = protocolMode === "https";
  const showHandshake = isSecure && (stage === "handshake" || stage === "request" || stage === "response" || stage === "complete");
  const showRequest = stage === "request" || stage === "response" || stage === "complete";
  const showResponse = stage === "response" || stage === "complete";

  const visibleMetadata = useMemo(() => ({
    destination: payload.domain,
    connectionType: vpnMode === "on" ? "VPN Tunnel (encrypted)" : "Direct",
    tlsVersion: isSecure ? "TLS 1.3" : "None",
  }), [payload.domain, vpnMode, isSecure]);

  if (stage === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Ready to observe
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Click "Send Request" to see what network observers could see when you submit the login form.
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
              <Badge variant="secondary">Metadata</Badge>
              <span className="text-sm text-muted-foreground">
                Always visible to network observers
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
                <span className="text-muted-foreground shrink-0">Destination:</span>
                <span className="text-foreground">{visibleMetadata.destination}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">Connection:</span>
                <span className={vpnMode === "on" ? "text-[hsl(var(--vpn-tunnel))]" : "text-foreground"}>
                  {visibleMetadata.connectionType}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-muted-foreground shrink-0">Encryption:</span>
                <span className={isSecure ? "text-[hsl(var(--https-success))]" : "text-[hsl(var(--http-danger))]"}>
                  {visibleMetadata.tlsVersion}
                </span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Even with encryption, the network can see you connected to this destination.
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
                  TLS Handshake
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
                      Encryption established
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The handshake process is visible to observers—they can see a secure connection is being established—but the encryption keys remain secret.</p>
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
                  <span className="font-medium">TLS 1.3 Handshake Complete</span>
                </div>
                <div className="font-mono text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">1.</span>
                    <span>Client Hello: supported cipher suites, random bytes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">2.</span>
                    <span>Server Hello: chosen cipher, server certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">3.</span>
                    <span>Key Exchange: ephemeral keys generated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">4.</span>
                    <span>Finished: encrypted session begins</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Observers can see this handshake occurred but cannot derive the session keys.
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
                      Request
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The HTTP request contains the data your browser sends to the server, including headers and body content.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground cursor-help flex items-center gap-1">
                      {isSecure ? "Encrypted payload" : "Plain text - VISIBLE"}
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{isSecure 
                      ? "The payload (request body) is encrypted and unreadable to network observers." 
                      : "The payload is sent as plain text—anyone on the network can read it."
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
                        <span className="font-medium">Encrypted Payload</span>
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
                    Network observers see encrypted data, not the actual content.
                  </p>
                  <p className="text-xs text-muted-foreground/70 italic">
                    Note: Ciphertext shown is illustrative, not an actual TLS dump.
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
                    Anyone on the network can read your credentials!
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
                      Response
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>The HTTP response contains data the server sends back, including headers (like cookies) and body content.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-sm text-muted-foreground cursor-help flex items-center gap-1">
                      {isSecure ? "Encrypted response" : "Plain text response"}
                      <Info className="w-3 h-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{isSecure 
                      ? "The response is encrypted—only your browser can decrypt it." 
                      : "The response is in plain text—anyone on the network can read it, including session tokens."
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
                        <span className="font-medium">Encrypted Response</span>
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
                    Session tokens are also visible! An attacker could hijack your session.
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
            {isSecure ? "Protected Transaction" : "Exposed Transaction"}
          </h4>
          <p className="text-sm text-muted-foreground">
            {isSecure 
              ? "Your credentials were encrypted. Network observers could see you connected, but not what you sent or received."
              : "Your credentials were sent in plain text. Anyone on the network could have captured your username, password, and session token."
            }
          </p>
        </div>
      )}
    </div>
  );
}
