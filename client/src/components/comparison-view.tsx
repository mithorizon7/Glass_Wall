import { useState, useCallback } from "react";
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
          Click "Run Comparison" to see the difference
        </div>
      )}

      {stage === "connect" && (
        <div className="space-y-2 animate-fade-in">
          <div className="text-xs text-muted-foreground font-medium">Connection</div>
          <div className="font-mono text-xs space-y-1 bg-muted/50 p-2 rounded">
            <div>
              <span className="text-muted-foreground">Host: </span>
              <span className="text-foreground">{payload.domain}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Protocol: </span>
              <span className={isHttps ? "text-green-600" : "text-red-600"}>
                {isHttps ? "TLS 1.3 (encrypted)" : "TCP (plain)"}
              </span>
            </div>
          </div>
        </div>
      )}

      {showRequest && (
        <div className="space-y-2 animate-fade-in">
          <div className="text-xs text-muted-foreground font-medium">Request Body</div>
          <div className="font-mono text-xs space-y-1 bg-muted/50 p-2 rounded">
            {isHttps ? (
              <div className="space-y-1">
                <div className="text-green-600 dark:text-green-400 text-[10px]">
                  Encrypted payload
                </div>
                <div className="flex flex-wrap gap-1">
                  {encryptedBlock("username")}
                  {encryptedBlock("password")}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <EyeOff className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-green-600">Content hidden from observers</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-red-600 dark:text-red-400 text-[10px]">
                  Plain text (visible!)
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
                  <span className="text-[10px] text-red-600">Anyone can read this!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showResponse && (
        <div className="space-y-2 animate-fade-in">
          <div className="text-xs text-muted-foreground font-medium">Server Response</div>
          <div className="font-mono text-xs bg-muted/50 p-2 rounded">
            {isHttps ? (
              <div className="flex items-center gap-1">
                <Badge className="bg-green-500/10 text-green-600 text-[10px]">
                  Encrypted
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
            ? "Connection secure - content encrypted" 
            : "Data exposed - credentials visible!"
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
            Compare HTTP vs HTTPS
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Columns className="w-5 h-5" />
            Side-by-Side Comparison
          </DialogTitle>
          <DialogDescription>
            See the same request in HTTP and HTTPS simultaneously
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-4 my-4">
          <Button 
            onClick={runComparison} 
            disabled={isAnimating}
            data-testid="button-run-comparison"
          >
            <Play className="w-4 h-4 mr-2" />
            Run Comparison
          </Button>
          <Button 
            variant="outline" 
            onClick={reset}
            disabled={stage === "idle"}
            data-testid="button-reset-comparison"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
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
              Key Takeaways
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Unlock className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">HTTP:</strong> All data travels in plain text. Anyone on your network can see your username, password, and session tokens.</span>
              </li>
              <li className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong className="text-foreground">HTTPS:</strong> Data is encrypted before transmission. Observers see scrambled data, not your actual credentials.</span>
              </li>
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
