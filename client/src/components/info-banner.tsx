import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface InfoBannerProps {
  type: "warning" | "info" | "success";
  icon: React.ReactNode;
  title: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function InfoBanner({
  type,
  icon,
  title,
  message,
  dismissible = false,
  onDismiss,
  className = "",
}: InfoBannerProps) {
  const { t } = useTranslation("common");
  const typeStyles = {
    warning:
      "bg-[hsl(var(--warning-bg))]/10 border-[hsl(var(--warning-bg))]/30 text-[hsl(var(--warning-bg))]",
    info: "bg-primary/10 border-primary/30 text-primary",
    success:
      "bg-[hsl(var(--https-success))]/10 border-[hsl(var(--https-success))]/30 text-[hsl(var(--https-success))]",
  };

  const iconBgStyles = {
    warning: "bg-[hsl(var(--warning-bg))]/20",
    info: "bg-primary/20",
    success: "bg-[hsl(var(--https-success))]/20",
  };

  const stripeStyles = {
    warning: "bg-[hsl(var(--warning-bg))]",
    info: "bg-primary",
    success: "bg-[hsl(var(--https-success))]",
  };

  return (
    <div
      className={`relative flex items-start gap-4 px-5 py-4 rounded-2xl border overflow-hidden shadow-[0_18px_40px_-32px_rgba(15,23,42,0.35)] backdrop-blur ${typeStyles[type]} ${className}`}
      role="alert"
      data-testid={`banner-${type}`}
    >
      <span
        className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${stripeStyles[type]}`}
        aria-hidden="true"
      />
      <div
        className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center ${iconBgStyles[type]}`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className="font-semibold text-foreground mb-1"
          data-testid={`text-banner-title-${type}`}
        >
          {title}
        </h3>
        <p className="text-sm text-muted-foreground" data-testid={`text-banner-message-${type}`}>
          {message}
        </p>
      </div>
      {dismissible && onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDismiss}
          aria-label={t("close")}
          className="shrink-0 opacity-60 hover:opacity-100"
          data-testid={`button-dismiss-banner-${type}`}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
