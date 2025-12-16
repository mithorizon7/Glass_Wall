import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Wifi, 
  Home, 
  Coffee,
  Plane,
  Hotel,
  AlertTriangle,
  Shield,
  ShieldOff,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Map,
} from "lucide-react";

export interface Scenario {
  id: string;
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
              {scenario.riskLevel} {t("scenarioSelector.risk")}
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
}

function ScenarioDetail({ scenario }: ScenarioDetailProps) {
  const { t } = useTranslation("glassWall");
  const Icon = scenario.icon;

  const name = t(`scenarioSelector.${scenario.id}.name`);
  const description = t(`scenarioSelector.${scenario.id}.description`);
  const details = t(`scenarioSelector.${scenario.id}.details`);

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
  trigger?: React.ReactNode;
}

export function ScenarioSelector({ currentScenario, onScenarioChange, trigger }: ScenarioSelectorProps) {
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
          <ScenarioDetail scenario={currentScenario} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
