import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  Lock,
  Unlock,
  Shield,
  Eye,
  EyeOff,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { useCallback, useId, useState } from "react";
import { openCheatSheetPrintPreview } from "@/lib/cheat-sheet-print";
import type { ReactNode } from "react";

interface CheatSheetModalProps {
  trigger?: ReactNode;
}

interface CheatSheetContentProps {
  showHeader?: boolean;
}

const TABLE_STATUS_MAP: Record<string, Array<"good" | "bad">> = {
  passwords: ["bad", "good", "good"],
  formData: ["bad", "good", "good"],
  websites: ["bad", "bad", "good"],
  ipAddress: ["bad", "bad", "good"],
};

export function CheatSheetModal({ trigger }: CheatSheetModalProps) {
  const { t } = useTranslation("glassWall");

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-cheat-sheet">
            <FileText className="w-4 h-4 mr-2" />
            {t("cheatSheetButton")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <CheatSheetContent showHeader />
      </DialogContent>
    </Dialog>
  );
}

export function CheatSheetContent({ showHeader = false }: CheatSheetContentProps) {
  const { t, i18n } = useTranslation("glassWall");
  const [printError, setPrintError] = useState(false);
  const printHintId = useId();

  const httpPoints = t("cheatSheet.httpPoints", { returnObjects: true }) as string[];
  const httpsPoints = t("cheatSheet.httpsPoints", { returnObjects: true }) as string[];
  const vpnPoints = t("cheatSheet.vpnPoints", { returnObjects: true }) as string[];
  const tableHeaders = t("cheatSheet.tableHeaders", { returnObjects: true }) as string[];
  const safetyTips = t("cheatSheet.safetyTips", { returnObjects: true }) as string[];
  const tableRows = t("cheatSheet.tableRows", { returnObjects: true }) as Record<string, string[]>;
  const attackerModels = t("cheatSheet.attackerModels", { returnObjects: true }) as string[];

  const getCellStatus = useCallback((rowKey: string, columnIndex: number) => {
    const statuses = TABLE_STATUS_MAP[rowKey];
    if (!statuses) return "good";
    return statuses[columnIndex] ?? "good";
  }, []);

  const handlePrint = () => {
    const opened = openCheatSheetPrintPreview(
      {
        language:
          i18n.resolvedLanguage === "pseudo"
            ? "en"
            : i18n.resolvedLanguage || i18n.language || "en",
        title: t("cheatSheet.printTitle"),
        instructions: t("cheatSheet.printInstructions"),
        printButton: t("cheatSheet.printButton"),
        legend: `${t("labels.legendTitle")} : ${t("labels.metadata")} / ${t("labels.content")}`,
        sections: [
          { title: t("cheatSheet.httpTitle"), points: httpPoints },
          { title: t("cheatSheet.httpsTitle"), points: httpsPoints },
          { title: t("cheatSheet.vpnTitle"), points: vpnPoints },
          { title: t("cheatSheet.attackerModelsTitle"), points: attackerModels },
        ],
        tableTitle: t("cheatSheet.comparisonTableTitle"),
        headers: tableHeaders,
        rows: Object.entries(tableRows).map(([key, row]) => ({
          label: row[0],
          cells: row.slice(1).map((text, index) => ({ text, status: getCellStatus(key, index) })),
        })),
        tips: { title: t("cheatSheet.safetyTipsTitle"), points: safetyTips },
        footer: t("cheatSheet.printFooter"),
      },
      () => window.open("", "_blank", "width=900,height=700"),
    );
    setPrintError(!opened);
  };

  return (
    <>
      {showHeader && (
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5" />
            {t("cheatSheet.modalTitle")}
          </DialogTitle>
          <DialogDescription>{t("cheatSheet.modalDescription")}</DialogDescription>
        </DialogHeader>
      )}

      <div className="flex gap-2 mb-4">
        <Button
          onClick={handlePrint}
          aria-describedby={printHintId}
          variant="outline"
          data-testid="button-print-cheat-sheet"
        >
          <Printer className="w-4 h-4 mr-2" />
          {t("cheatSheet.printButton")}
        </Button>
      </div>

      <p id={printHintId} className="text-sm text-muted-foreground mb-4">
        {t("cheatSheet.printHint")}
      </p>
      {printError && (
        <p role="alert" className="text-sm text-destructive mb-4">
          {t("cheatSheet.printError")}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <span>{t("labels.legendTitle")}</span>
        <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
          {t("labels.metadata")}
        </Badge>
        <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
          {t("labels.content")}
        </Badge>
      </div>

      <div className="space-y-6">
        <Card className="p-4 pl-6 bg-gradient-to-r from-red-500/10 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Unlock className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-lg text-foreground">{t("cheatSheet.httpTitle")}</h3>
            <Badge variant="destructive" className="text-xs">
              {t("cheatSheet.httpBadge")}
            </Badge>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(httpPoints) &&
              httpPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  {i === 0 ? (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  ) : i === 1 ? (
                    <Eye className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <span>{point}</span>
                </li>
              ))}
          </ul>
        </Card>

        <Card className="p-4 pl-6 bg-gradient-to-r from-green-500/10 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-lg text-foreground">{t("cheatSheet.httpsTitle")}</h3>
            <Badge className="bg-green-500/10 text-green-600 text-xs">
              {t("cheatSheet.httpsBadge")}
            </Badge>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(httpsPoints) &&
              httpsPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  {i < 2 ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  ) : i === 2 ? (
                    <EyeOff className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <span>{point}</span>
                </li>
              ))}
          </ul>
        </Card>

        <Card className="p-4 pl-6 bg-gradient-to-r from-[hsl(var(--vpn-tunnel))]/10 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-[hsl(var(--vpn-tunnel))]" />
            <h3 className="font-semibold text-lg text-foreground">{t("cheatSheet.vpnTitle")}</h3>
            <Badge className="bg-[hsl(var(--vpn-tunnel))]/10 text-[hsl(var(--vpn-tunnel))] text-xs">
              {t("cheatSheet.vpnBadge")}
            </Badge>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(vpnPoints) &&
              vpnPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  {i < 3 ? (
                    <CheckCircle className="w-4 h-4 text-[hsl(var(--vpn-tunnel))] mt-0.5 shrink-0" />
                  ) : i === 3 ? (
                    <EyeOff className="w-4 h-4 text-[hsl(var(--vpn-tunnel))] mt-0.5 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  <span>{point}</span>
                </li>
              ))}
          </ul>
        </Card>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                {Array.isArray(tableHeaders) &&
                  tableHeaders.map((header, i) => (
                    <th
                      key={i}
                      className={`p-3 ${i === 0 ? "text-left" : "text-center"} font-semibold text-foreground`}
                    >
                      {header}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {tableRows &&
                typeof tableRows === "object" &&
                Object.entries(tableRows).map(([key, row]) => (
                  <tr key={key} className="border-t">
                    {Array.isArray(row) &&
                      row.map((cell, i) => (
                        <td
                          key={i}
                          className={`p-3 ${i === 0 ? "text-muted-foreground" : "text-center"}`}
                        >
                          {i === 0 ? (
                            cell
                          ) : (
                            <Badge
                              variant={
                                getCellStatus(key, i - 1) === "bad" ? "destructive" : "default"
                              }
                              className={`text-xs ${
                                getCellStatus(key, i - 1) === "bad"
                                  ? ""
                                  : "bg-green-500/10 text-green-600"
                              }`}
                            >
                              {cell}
                            </Badge>
                          )}
                        </td>
                      ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Card className="p-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-foreground">{t("cheatSheet.safetyTipsTitle")}</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(safetyTips) &&
              safetyTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
          </ul>
        </Card>

        <Card className="p-4 border-dashed">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-foreground">{t("cheatSheet.attackerModelsTitle")}</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {Array.isArray(attackerModels) &&
              attackerModels.map((model, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                  <span>{model}</span>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
