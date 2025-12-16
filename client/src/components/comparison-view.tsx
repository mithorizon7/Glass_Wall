import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Columns,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Play,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { type DemoPayload, type TimelineStage, type VpnMode } from "@/pages/glass-wall";

interface ComparisonWireViewProps {
  protocolMode: "http" | "https";
  vpnMode: VpnMode;
  stage: TimelineStage;
  payload: DemoPayload;
}

function ComparisonWireView({ protocolMode, vpnMode, stage, payload }: ComparisonWireViewProps) {
  const { t } = useTranslation("glassWall");
  const isHttps = protocolMode === "https";
  const showRequest = stage === "request" || stage === "response" || stage === "complete";
  const showResponse = stage === "response" || stage === "complete";

  const encryptedBlock = (text: string) => (
    <span className="font-mono text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-1 rounded">
      {"█".repeat(Math.min(text.length, 12))}
    </span>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {isHttps ? (
          <>
            <Lock className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-green-600 dark:text-green-400">HTTPS</span>
          </>
        ) : (
          <>
            <Unlock className="w-4 h-4 text-red-500" />
            <span className="font-semibold text-red-600 dark:text-red-400">HTTP</span>
          </>
        )}
        {vpnMode === "on" && (
          <Badge className="bg-purple-500/10 text-purple-600 text-xs">+ VPN</Badge>
        )}
      </div>

      {stage === "idle" && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          {t("comparison.clickToRun")}
        </div>
      )}

      {stage === "connect" && (
        <div className="space-y-2 animate-fade-in">
          <div className="text-xs text-muted-foreground font-medium">{t("comparison.connection")}</div>
          <div className="font-mono text-xs space-y-1 bg-muted/50 p-2 rounded">
            <div>
              <span className="text-muted-foreground">Host: </span>
              <span className="text-foreground">{payload.domain}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("comparison.protocol")}: </span>
              <span className={isHttps ? "text-green-600" : "text-red-600"}>
                {isHttps ? t("comparison.tlsEncrypted") : t("comparison.tcpPlain")}
              </span>
            </div>
          </div>
        </div>
      )}

      {showRequest && (
        <div className="space-y-2 animate-fade-in">
          <div className="text-xs text-muted-foreground font-medium">{t("comparison.requestBody")}</div>
          <div className="font-mono text-xs space-y-1 bg-muted/50 p-2 rounded">
            {isHttps ? (
              <div className="space-y-1">
                <div className="text-green-600 dark:text-green-400 text-[10px]">
                  {t("comparison.encryptedPayload")}
                </div>
                <div className="flex flex-wrap gap-1">
                  {encryptedBlock("username")}
                  {encryptedBlock("password")}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <EyeOff className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-green-600">{t("comparison.contentHidden")}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-red-600 dark:text-red-400 text-[10px]">
                  {t("comparison.plainTextVisible")}
                </div>
                <div>
                  <span className="text-muted-foreground">username: </span>
                  <span className="text-red-600">{payload.body.username}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">password: </span>
                  <span className="text-red-600">{payload.body.password}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Eye className="w-3 h-3 text-red-500" />
                  <span className="text-[10px] text-red-600">{t("comparison.anyoneCanRead")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showResponse && (
        <div className="space-y-2 animate-fade-in">
          <div className="text-xs text-muted-foreground font-medium">{t("comparison.serverResponse")}</div>
          <div className="font-mono text-xs bg-muted/50 p-2 rounded">
            {isHttps ? (
              <div className="flex items-center gap-1">
                <Badge className="bg-green-500/10 text-green-600 text-[10px]">
                  {t("comparison.encrypted")}
                </Badge>
                {encryptedBlock("response data")}
              </div>
            ) : (
              <div className="text-red-600">
                {`{"status": "success", "token": "abc123..."}`}
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "complete" && (
        <div className={`p-2 rounded text-xs text-center ${
          isHttps 
            ? "bg-green-500/10 text-green-600 dark:text-green-400" 
            : "bg-red-500/10 text-red-600 dark:text-red-400"
        }`}>
          {isHttps 
            ? t("comparison.secureConnection")
            : t("comparison.dataExposed")
          }
        </div>
      )}
    </div>
  );
}

interface ComparisonViewProps {
  payload: DemoPayload;
  vpnMode: VpnMode;
  trigger?: React.ReactNode;
}

export function ComparisonView({ payload, vpnMode, trigger }: ComparisonViewProps) {
  const { t } = useTranslation("glassWall");
  const [stage, setStage] = useState<TimelineStage>("idle");
  const [isAnimating, setIsAnimating] = useState(false);

  const runComparison = useCallback(async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setStage("idle");
    
    const stages: TimelineStage[] = ["connect", "request", "response", "complete"];
    
    for (const s of stages) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStage(s);
    }
    
    setIsAnimating(false);
  }, [isAnimating]);

  const reset = useCallback(() => {
    setStage("idle");
    setIsAnimating(false);
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-comparison-view">
            <Columns className="w-4 h-4 mr-2" />
            {t("compareHttpVsHttps")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Columns className="w-5 h-5" />
            {t("comparison.title")}
          </DialogTitle>
          <DialogDescription>
            {t("comparison.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-4 my-4">
          <Button 
            onClick={runComparison} 
            disabled={isAnimating}
            data-testid="button-run-comparison"
          >
            <Play className="w-4 h-4 mr-2" />
            {t("comparison.runComparison")}
          </Button>
          <Button 
            variant="outline" 
            onClick={reset}
            disabled={stage === "idle"}
            data-testid="button-reset-comparison"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("comparison.reset")}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 border-l-4 border-l-red-500">
            <ComparisonWireView
              protocolMode="http"
              vpnMode={vpnMode}
              stage={stage}
              payload={payload}
            />
          </Card>

          <Card className="p-4 border-l-4 border-l-green-500">
            <ComparisonWireView
              protocolMode="https"
              vpnMode={vpnMode}
              stage={stage}
              payload={payload}
            />
          </Card>
        </div>

        {stage === "complete" && (
          <div className="mt-4 p-4 bg-muted rounded-lg animate-fade-in">
            <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              {t("comparison.keyTakeaways")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Unlock className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">HTTP:</strong> {t("comparison.httpExplained")}</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">HTTPS:</strong> {t("comparison.httpsExplained")}</span>
              </li>
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
