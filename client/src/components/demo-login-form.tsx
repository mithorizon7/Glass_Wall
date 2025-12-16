import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Globe } from "lucide-react";
import type { DemoPayload, ProtocolMode } from "@/pages/glass-wall";

interface DemoLoginFormProps {
  payload: DemoPayload;
  protocolMode: ProtocolMode;
}

export function DemoLoginForm({ payload, protocolMode }: DemoLoginFormProps) {
  const { t } = useTranslation("glassWall");
  const isSecure = protocolMode === "https";
  
  return (
    <div className="space-y-6">
      <div 
        className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
          isSecure 
            ? "bg-[hsl(var(--https-success))]/5 border-[hsl(var(--https-success))]/20" 
            : "bg-[hsl(var(--http-danger))]/5 border-[hsl(var(--http-danger))]/20"
        }`}
        data-testid="container-url-bar"
      >
        {isSecure ? (
          <Lock className="w-4 h-4 text-[hsl(var(--https-success))] shrink-0" />
        ) : (
          <Unlock className="w-4 h-4 text-[hsl(var(--http-danger))] shrink-0" />
        )}
        <span className="font-mono text-sm truncate">
          <span className={isSecure ? "text-[hsl(var(--https-success))]" : "text-[hsl(var(--http-danger))]"}>
            {protocolMode}://
          </span>
          <span className="text-foreground">{payload.domain}/login</span>
        </span>
      </div>

      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">{t("loginForm.title")}</span>
          </div>
          <Badge variant="outline" className="text-xs uppercase tracking-wider">
            Demo
          </Badge>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="demo-username" className="text-sm font-medium">
              {t("loginForm.usernameLabel")}
            </Label>
            <Input
              id="demo-username"
              type="text"
              value={payload.body.username}
              readOnly
              className="bg-background/50 font-mono"
              data-testid="input-demo-username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="demo-password" className="text-sm font-medium">
              {t("loginForm.passwordLabel")}
            </Label>
            <Input
              id="demo-password"
              type="password"
              value={payload.body.password}
              readOnly
              className="bg-background/50 font-mono"
              data-testid="input-demo-password"
            />
          </div>
          
          <Button 
            className="w-full mt-4" 
            variant="secondary"
            disabled
            data-testid="button-demo-login"
          >
            {t("loginForm.signInButton")}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-4 italic">
          {t("loginForm.demoNote")}
        </p>
      </div>
    </div>
  );
}
