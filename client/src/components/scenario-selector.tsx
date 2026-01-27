import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Home, 
  Coffee,
  Plane,
  Hotel,
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Map,
} from "lucide-react";

type AttackerModel = "passive" | "rogueHotspot" | "compromisedEndpoint";
type ScenarioId = "home" | "coffeeShop" | "airport" | "hotel";

export interface Scenario {
  id: ScenarioId;
  icon: React.ElementType;
  riskLevel: "low" | "medium" | "high";
}

export const SCENARIOS: Scenario[] = [
  {
    id: "home",
    icon: Home,
    riskLevel: "low",
  },
  {
    id: "coffeeShop",
    icon: Coffee,
    riskLevel: "high",
  },
  {
    id: "airport",
    icon: Plane,
    riskLevel: "high",
  },
  {
    id: "hotel",
    icon: Hotel,
    riskLevel: "medium",
  },
];

const PRACTICE_STEPS: Record<ScenarioId, Array<{ id: string; correctByModel: Record<AttackerModel, number> }>> = {
  home: [
    { id: "step1", correctByModel: { passive: 0, rogueHotspot: 0, compromisedEndpoint: 2 } },
    { id: "step2", correctByModel: { passive: 0, rogueHotspot: 0, compromisedEndpoint: 0 } },
  ],
  coffeeShop: [
    { id: "step1", correctByModel: { passive: 0, rogueHotspot: 1, compromisedEndpoint: 2 } },
    { id: "step2", correctByModel: { passive: 0, rogueHotspot: 0, compromisedEndpoint: 2 } },
  ],
  airport: [
    { id: "step1", correctByModel: { passive: 0, rogueHotspot: 0, compromisedEndpoint: 2 } },
    { id: "step2", correctByModel: { passive: 1, rogueHotspot: 1, compromisedEndpoint: 2 } },
  ],
  hotel: [
    { id: "step1", correctByModel: { passive: 0, rogueHotspot: 0, compromisedEndpoint: 2 } },
    { id: "step2", correctByModel: { passive: 0, rogueHotspot: 0, compromisedEndpoint: 2 } },
  ],
};

interface ScenarioCardProps {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: () => void;
}

function ScenarioCard({ scenario, isSelected, onSelect }: ScenarioCardProps) {
  const { t } = useTranslation("glassWall");
  const Icon = scenario.icon;
  const riskColors = {
    low: "bg-green-500/10 text-green-600 border-green-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    high: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  const name = t(`scenarioSelector.${scenario.id}.name`);
  const description = t(`scenarioSelector.${scenario.id}.description`);

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all hover-elevate ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
      data-testid={`scenario-card-${scenario.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          scenario.riskLevel === "low" ? "bg-green-500/10" :
          scenario.riskLevel === "medium" ? "bg-amber-500/10" :
          "bg-red-500/10"
        }`}>
          <Icon className={`w-5 h-5 ${
            scenario.riskLevel === "low" ? "text-green-600" :
            scenario.riskLevel === "medium" ? "text-amber-600" :
            "text-red-600"
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground truncate">{name}</h4>
            <Badge className={`text-[10px] ${riskColors[scenario.riskLevel]}`}>
              {t(`scenarioSelector.riskLevels.${scenario.riskLevel}`)} {t("scenarioSelector.risk")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
    </Card>
  );
}

interface ScenarioDetailProps {
  scenario: Scenario;
  attackerModel: AttackerModel;
}

interface ScenarioPracticeProps {
  scenarioId: ScenarioId;
  attackerModel: AttackerModel;
}

function ScenarioPractice({ scenarioId, attackerModel }: ScenarioPracticeProps) {
  const { t } = useTranslation("glassWall");
  const steps = useMemo(() => PRACTICE_STEPS[scenarioId] ?? [], [scenarioId]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setCurrentStepIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  }, [scenarioId, attackerModel]);

  if (steps.length === 0) {
    return null;
  }

  const currentStep = steps[currentStepIndex];
  const prompt = t(`scenarioSelector.practice.${scenarioId}.${currentStep.id}.prompt`);
  const options = t(`scenarioSelector.practice.${scenarioId}.${currentStep.id}.options`, { returnObjects: true }) as string[];
  const attackerLabel = t(`controls.attackerModels.${attackerModel}`);
  const correctIndex = currentStep.correctByModel[attackerModel];
  const isCorrect = selectedAnswer === correctIndex;
  const rationale = t(
    `scenarioSelector.practice.${scenarioId}.${currentStep.id}.rationale.${attackerModel}`,
    { model: attackerLabel }
  );
  const feedbackText = selectedAnswer === null
    ? ""
    : selectedAnswer === correctIndex
      ? t("scenarioSelector.practice.feedback.correct", { rationale })
      : t("scenarioSelector.practice.feedback.incorrect", { correctOption: options?.[correctIndex] ?? "", rationale });
  const progressPercent = ((currentStepIndex + (selectedAnswer !== null ? 1 : 0)) / steps.length) * 100;

  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      return;
    }
    setCurrentStepIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const nextLabel = currentStepIndex < steps.length - 1
    ? t("scenarioSelector.practice.nextStep")
    : t("scenarioSelector.practice.restart");

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-medium text-foreground">{t("scenarioSelector.practice.title")}</p>
          <p className="text-xs text-muted-foreground">{t("scenarioSelector.practice.description")}</p>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          {t("scenarioSelector.practice.attackerModelLabel")}: {attackerLabel}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("scenarioSelector.practice.stepLabel", { current: currentStepIndex + 1, total: steps.length })}</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <h4 className="text-sm font-medium text-foreground mb-3">
        {prompt}
      </h4>

      <div className="space-y-2">
        {Array.isArray(options) && options.map((option: string, index: number) => {
          let bgColor = "";
          let borderColor = "";

          if (selectedAnswer !== null) {
            if (index === correctIndex) {
              bgColor = "bg-green-500/10";
              borderColor = "border-green-500";
            } else if (index === selectedAnswer && !isCorrect) {
              bgColor = "bg-red-500/10";
              borderColor = "border-red-500";
            }
          }

          return (
            <Button
              key={index}
              variant="outline"
              className={`w-full justify-start text-left h-auto py-3 px-4 ${bgColor} ${borderColor ? `border-2 ${borderColor}` : ""}`}
              onClick={() => handleSelectAnswer(index)}
              disabled={selectedAnswer !== null}
              data-testid={`button-practice-option-${scenarioId}-${currentStep.id}-${index}`}
            >
              <span className="flex items-center gap-3">
                {selectedAnswer !== null && index === correctIndex && (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                {selectedAnswer !== null && index === selectedAnswer && !isCorrect && (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                {(selectedAnswer === null || (index !== correctIndex && index !== selectedAnswer)) && (
                  <span className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{option}</span>
              </span>
            </Button>
          );
        })}
      </div>

      {showExplanation && (
        <Card className={`mt-4 p-3 animate-fade-in ${isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
          <div className="flex items-start gap-2">
            {isCorrect ? (
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium mb-1 ${isCorrect ? "text-green-600" : "text-amber-600"}`}>
                {isCorrect ? t("quiz.correct") : t("quiz.incorrect")}
              </p>
              <p className="text-sm text-muted-foreground">
                {feedbackText}
              </p>
            </div>
          </div>
        </Card>
      )}

      {selectedAnswer !== null && (
        <Button
          onClick={handleNext}
          className="w-full mt-4"
          data-testid={`button-practice-next-${scenarioId}-${currentStep.id}`}
        >
          {nextLabel}
        </Button>
      )}
    </Card>
  );
}

function ScenarioDetail({ scenario, attackerModel }: ScenarioDetailProps) {
  const { t } = useTranslation("glassWall");
  const Icon = scenario.icon;

  const name = t(`scenarioSelector.${scenario.id}.name`);
  const description = t(`scenarioSelector.${scenario.id}.description`);
  const details = t(`scenarioSelector.${scenario.id}.details`);
  const attackerNote = t(`scenarioSelector.attackerModelNotes.${attackerModel}`);

  const threats = [];
  for (let i = 1; i <= 4; i++) {
    const key = `scenarioSelector.${scenario.id}.threat${i}`;
    const threat = t(key, { defaultValue: "" });
    if (threat && threat !== key) {
      threats.push(threat);
    }
  }

  const recommendations = [];
  for (let i = 1; i <= 4; i++) {
    const key = `scenarioSelector.${scenario.id}.rec${i}`;
    const rec = t(key, { defaultValue: "" });
    if (rec && rec !== key) {
      recommendations.push(rec);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          scenario.riskLevel === "low" ? "bg-green-500/10" :
          scenario.riskLevel === "medium" ? "bg-amber-500/10" :
          "bg-red-500/10"
        }`}>
          <Icon className={`w-6 h-6 ${
            scenario.riskLevel === "low" ? "text-green-600" :
            scenario.riskLevel === "medium" ? "text-amber-600" :
            "text-red-600"
          }`} />
        </div>
        <div>
          <h3 className="font-semibold text-lg text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{details}</p>

      <Card className="p-3 border-dashed">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <p className="text-sm font-medium text-foreground">
            {t("scenarioSelector.attackerModelTitle")}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{attackerNote}</p>
      </Card>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            {t("scenarioSelector.whoCanSee")}
          </h4>
          <ul className="space-y-1">
            {threats.map((threat, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                <span>{threat}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            {t("scenarioSelector.recommendations")}
          </h4>
          <ul className="space-y-1">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ScenarioPractice scenarioId={scenario.id} attackerModel={attackerModel} />

      <Card className={`p-3 ${
        scenario.riskLevel === "low" ? "bg-green-500/5 border-green-500/20" :
        scenario.riskLevel === "medium" ? "bg-amber-500/5 border-amber-500/20" :
        "bg-red-500/5 border-red-500/20"
      }`}>
        <div className="flex items-center gap-2">
          {scenario.riskLevel === "low" ? (
            <>
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {t("scenarioSelector.httpsUsuallyEnough")}
              </span>
            </>
          ) : scenario.riskLevel === "medium" ? (
            <>
              <Shield className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">
                {t("scenarioSelector.httpsRecommendedVpnSensitive")}
              </span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                {t("scenarioSelector.vpnStronglyRecommended")}
              </span>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

interface ScenarioSelectorProps {
  currentScenario: Scenario;
  onScenarioChange: (scenario: Scenario) => void;
  attackerModel: AttackerModel;
  trigger?: React.ReactNode;
}

export function ScenarioSelector({ currentScenario, onScenarioChange, attackerModel, trigger }: ScenarioSelectorProps) {
  const { t } = useTranslation("glassWall");

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-scenario-selector">
            <Map className="w-4 h-4 mr-2" />
            {t("scenarios")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            {t("scenarioSelector.title")}
          </DialogTitle>
          <DialogDescription>
            {t("scenarioSelector.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {SCENARIOS.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              isSelected={currentScenario.id === scenario.id}
              onSelect={() => onScenarioChange(scenario)}
            />
          ))}
        </div>

        <div className="border-t pt-4">
          <ScenarioDetail scenario={currentScenario} attackerModel={attackerModel} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
