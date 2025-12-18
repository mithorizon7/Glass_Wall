import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Eye, EyeOff, AlertTriangle, ShieldCheck, Monitor, Server, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TimelineStage, ProtocolMode, VpnMode, DemoPayload } from "@/pages/glass-wall";

interface WireViewProps {
  stage: TimelineStage;
  protocolMode: ProtocolMode;
  vpnMode: VpnMode;
  payload: DemoPayload;
}

function generateCiphertext(text: string): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function DataPacket({ 
  username, 
  password, 
  isSecure,
  stage,
  isVisible
}: { 
  username: string; 
  password: string; 
  isSecure: boolean;
  stage: TimelineStage;
  isVisible: boolean;
}) {
  const { t } = useTranslation("glassWall");
  
  const encryptedUsername = useMemo(() => generateCiphertext(username), [username]);
  const encryptedPassword = useMemo(() => generateCiphertext(password), [password]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`rounded-lg p-3 font-mono text-xs border-2 max-w-[200px] ${
        isSecure 
          ? "bg-[hsl(var(--https-success))]/10 border-[hsl(var(--https-success))]/40" 
          : "bg-[hsl(var(--http-danger))]/10 border-[hsl(var(--http-danger))]/40"
      }`}
    >
      {isSecure ? (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[hsl(var(--https-success))] mb-2">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] font-medium">{t("wireView.encrypted")}</span>
          </div>
          <div className="text-muted-foreground break-all leading-tight opacity-70">
            {encryptedUsername}
          </div>
          <div className="text-muted-foreground break-all leading-tight opacity-70">
            {encryptedPassword}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[hsl(var(--http-danger))] mb-2">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-[10px] font-medium">{t("wireView.plainText")}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-muted-foreground">user:</span>
            <span className="text-foreground font-semibold" data-testid="text-wire-username">{username}</span>
          </div>
          <div className="flex gap-1">
            <span className="text-muted-foreground">pass:</span>
            <span className="text-[hsl(var(--http-danger))] font-semibold" data-testid="text-wire-password">{password}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function WireView({ stage, protocolMode, vpnMode, payload }: WireViewProps) {
  const { t } = useTranslation("glassWall");
  const isSecure = protocolMode === "https";
  const isActive = stage !== "idle";
  const showRequest = stage === "request" || stage === "response" || stage === "complete";
  const showResponse = stage === "response" || stage === "complete";
  const showHandshake = isSecure && (stage === "handshake" || showRequest);

  const getPacketPosition = () => {
    if (stage === "connect" || stage === "handshake") return 0;
    if (stage === "request") return 1;
    if (stage === "response" || stage === "complete") return 2;
    return -1;
  };

  const packetPosition = getPacketPosition();

  if (stage === "idle") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <Eye className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-1">
          {t("wireView.readyToObserve")}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {t("wireView.readyToObserveHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="relative">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
              isActive ? "bg-primary/10" : "bg-muted/30"
            }`}>
              <Monitor className={`w-6 h-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <span className="text-xs text-muted-foreground">{t("wireView.browser")}</span>
          </div>

          <div className="flex-1 flex items-center justify-center relative h-24">
            <div className={`absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full transition-colors ${
              isSecure 
                ? "bg-[hsl(var(--https-success))]/20" 
                : "bg-[hsl(var(--http-danger))]/20"
            }`}>
              <motion.div
                className={`h-full rounded-full ${
                  isSecure 
                    ? "bg-[hsl(var(--https-success))]" 
                    : "bg-[hsl(var(--http-danger))]"
                }`}
                initial={{ width: "0%" }}
                animate={{ 
                  width: stage === "connect" ? "25%" : 
                         stage === "handshake" ? "40%" : 
                         stage === "request" ? "70%" : 
                         stage === "response" || stage === "complete" ? "100%" : "0%"
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {vpnMode === "on" && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-8 border-2 border-dashed border-[hsl(var(--vpn-tunnel))]/40 rounded-full flex items-center justify-center">
                <span className="text-[10px] text-[hsl(var(--vpn-tunnel))] bg-background px-2">VPN</span>
              </div>
            )}

            <AnimatePresence mode="wait">
              {showRequest && (
                <motion.div
                  key="packet"
                  className="absolute z-10"
                  initial={{ left: "10%", opacity: 0 }}
                  animate={{ 
                    left: packetPosition === 1 ? "40%" : packetPosition === 2 ? "70%" : "10%",
                    opacity: 1
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  style={{ top: "50%", transform: "translate(-50%, -50%)" }}
                >
                  <DataPacket
                    username={payload.body.username}
                    password={payload.body.password}
                    isSecure={isSecure}
                    stage={stage}
                    isVisible={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
              {showHandshake && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-1/4 -translate-x-1/2 -top-10"
                >
                  <Badge 
                    variant="outline" 
                    className="text-[10px] border-[hsl(var(--https-success))]/50 text-[hsl(var(--https-success))] bg-background"
                  >
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    TLS
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {vpnMode === "on" && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--vpn-tunnel))]/10 flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-[hsl(var(--vpn-tunnel))]" />
                </div>
                <span className="text-[10px] text-muted-foreground">VPN</span>
              </div>
            )}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                showResponse ? (isSecure ? "bg-[hsl(var(--https-success))]/10" : "bg-[hsl(var(--http-danger))]/10") : "bg-muted/30"
              }`}>
                <Server className={`w-6 h-6 ${
                  showResponse 
                    ? (isSecure ? "text-[hsl(var(--https-success))]" : "text-[hsl(var(--http-danger))]")
                    : "text-muted-foreground"
                }`} />
              </div>
              <span className="text-xs text-muted-foreground">{t("wireView.server")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg border transition-colors ${
        isSecure 
          ? "bg-[hsl(var(--https-success))]/5 border-[hsl(var(--https-success))]/20" 
          : "bg-[hsl(var(--http-danger))]/5 border-[hsl(var(--http-danger))]/20"
      }`}>
        <div className="flex items-start gap-3">
          {isSecure ? (
            <EyeOff className="w-5 h-5 text-[hsl(var(--https-success))] shrink-0 mt-0.5" />
          ) : (
            <Eye className="w-5 h-5 text-[hsl(var(--http-danger))] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium mb-2 ${
              isSecure ? "text-[hsl(var(--https-success))]" : "text-[hsl(var(--http-danger))]"
            }`}>
              {isSecure ? t("wireView.whatObserverSeesSecure") : t("wireView.whatObserverSeesPlain")}
            </p>
            
            {showRequest && (
              <div className="font-mono text-xs space-y-1 bg-background/50 rounded p-3">
                {isSecure ? (
                  <div className="text-muted-foreground">
                    <div className="opacity-60">{t("wireView.destinationVisible")}: {payload.domain}</div>
                    <div className="mt-2 break-all opacity-40">
                      {generateCiphertext(payload.body.username + payload.body.password + "additional_encrypted_data")}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-muted-foreground">POST /login HTTP/1.1</div>
                    <div className="text-muted-foreground">Host: {payload.domain}</div>
                    <div className="mt-2">
                      <span className="text-muted-foreground">username: </span>
                      <span className="text-foreground font-semibold">{payload.body.username}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">password: </span>
                      <span className="text-[hsl(var(--http-danger))] font-semibold">{payload.body.password}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {stage === "complete" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
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
        </motion.div>
      )}
    </div>
  );
}
