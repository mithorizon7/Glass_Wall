import { useState } from "react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, FileText, Columns, HelpCircle } from "lucide-react";
import { CheatSheetContent } from "@/components/cheat-sheet-modal";
import { ComparisonContent } from "@/components/comparison-view";
import { QuizContent } from "@/components/quiz-mode";
import type { DemoPayload, VpnMode, TimelineStage, ProtocolMode } from "@/pages/glass-wall";

interface TimelineLink {
  stage: TimelineStage;
  sectionId: "metadata" | "handshake" | "request" | "response";
  protocolMode?: ProtocolMode;
  vpnMode?: VpnMode;
}

interface LearningToolsHubProps {
  payload: DemoPayload;
  vpnMode: VpnMode;
  onShowInTimeline?: (link: TimelineLink) => void;
  trigger?: ReactNode;
}

export function LearningToolsHub({
  payload,
  vpnMode,
  onShowInTimeline,
  trigger,
}: LearningToolsHubProps) {
  const { t } = useTranslation("glassWall");
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("cheatSheet");

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setActiveTab("cheatSheet");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-learning-tools">
            <BookOpen className="w-4 h-4 mr-2" />
            {t("learningTools.button")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {t("learningTools.title")}
          </DialogTitle>
          <DialogDescription>{t("learningTools.description")}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="cheatSheet" className="gap-2">
              <FileText className="w-4 h-4" />
              {t("learningTools.tabs.cheatSheet")}
            </TabsTrigger>
            <TabsTrigger value="comparison" className="gap-2">
              <Columns className="w-4 h-4" />
              {t("learningTools.tabs.comparison")}
            </TabsTrigger>
            <TabsTrigger value="quiz" className="gap-2">
              <HelpCircle className="w-4 h-4" />
              {t("learningTools.tabs.quiz")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cheatSheet">
            <CheatSheetContent showHeader />
          </TabsContent>

          <TabsContent value="comparison">
            <ComparisonContent
              payload={payload}
              vpnMode={vpnMode}
              isActive={open && activeTab === "comparison"}
              showHeader
            />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizContent
              onShowInTimeline={onShowInTimeline}
              onRequestClose={() => setOpen(false)}
              showHeader
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
