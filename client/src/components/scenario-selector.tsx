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
  name: string;
  icon: React.ElementType;
  description: string;
  riskLevel: "low" | "medium" | "high";
  threatActors: string[];
  recommendations: string[];
  details: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "home",
    name: "Home Network",
    icon: Home,
    description: "Your personal Wi-Fi at home",
    riskLevel: "low",
    threatActors: [
      "Your ISP can see which websites you visit",
      "Family members on the same network",
      "Compromised smart home devices (rare)",
    ],
    recommendations: [
      "Use HTTPS for sensitive sites (usually automatic)",
      "Keep router firmware updated",
      "Use a strong Wi-Fi password",
    ],
    details: "Home networks are generally safe because you control the router and who connects. Your main concern is your ISP's ability to see your browsing metadata and any family members sharing the network.",
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop Wi-Fi",
    icon: Coffee,
    description: "Public Wi-Fi at cafes and restaurants",
    riskLevel: "high",
    threatActors: [
      "Anyone else on the same network",
      "Fake hotspots impersonating the venue",
      "Network sniffers capturing unencrypted traffic",
      "Man-in-the-middle attacks",
    ],
    recommendations: [
      "Always verify the network name with staff",
      "Only use HTTPS websites",
      "Consider using a VPN",
      "Avoid logging into banking or sensitive accounts",
    ],
    details: "Coffee shop Wi-Fi is high risk because anyone can join, and you can't verify who controls the network. Attackers often create fake hotspots with similar names to intercept traffic.",
  },
  {
    id: "airport",
    name: "Airport Wi-Fi",
    icon: Plane,
    description: "Public Wi-Fi in airports and lounges",
    riskLevel: "high",
    threatActors: [
      "High volume of potential attackers",
      "Fake hotspots (very common)",
      "Corporate espionage",
      "Automated scanning tools",
    ],
    recommendations: [
      "Use cellular data if possible",
      "VPN is strongly recommended",
      "Avoid file sharing or remote access",
      "Log out of accounts when done",
    ],
    details: "Airports are high-value targets for attackers due to the volume of business travelers. Fake hotspots are extremely common, and the high traffic provides cover for malicious activity.",
  },
  {
    id: "hotel",
    name: "Hotel Wi-Fi",
    icon: Hotel,
    description: "Hotel and accommodation networks",
    riskLevel: "medium",
    threatActors: [
      "Other hotel guests",
      "Compromised hotel network equipment",
      "Hotel IT staff (insider threat)",
      "Fake networks in busy areas",
    ],
    recommendations: [
      "Use VPN for business activities",
      "Verify the official network name",
      "Avoid sensitive transactions",
      "Use your phone's hotspot for important work",
    ],
    details: "Hotel networks are moderately risky. While they typically have some security measures, you're sharing the network with strangers. Business travelers are often targeted.",
  },
];

interface ScenarioCardProps {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: () => void;
}

function ScenarioCard({ scenario, isSelected, onSelect }: ScenarioCardProps) {
  const Icon = scenario.icon;
  const riskColors = {
    low: "bg-green-500/10 text-green-600 border-green-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    high: "bg-red-500/10 text-red-600 border-red-500/20",
  };

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
            <h4 className="font-semibold text-foreground truncate">{scenario.name}</h4>
            <Badge className={`text-[10px] ${riskColors[scenario.riskLevel]}`}>
              {scenario.riskLevel} risk
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{scenario.description}</p>
        </div>
      </div>
    </Card>
  );
}

interface ScenarioDetailProps {
  scenario: Scenario;
}

function ScenarioDetail({ scenario }: ScenarioDetailProps) {
  const Icon = scenario.icon;

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
          <h3 className="font-semibold text-lg text-foreground">{scenario.name}</h3>
          <p className="text-sm text-muted-foreground">{scenario.description}</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{scenario.details}</p>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            Who Can See Your Traffic
          </h4>
          <ul className="space-y-1">
            {scenario.threatActors.map((actor, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                <span>{actor}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Recommendations
          </h4>
          <ul className="space-y-1">
            {scenario.recommendations.map((rec, i) => (
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
                HTTPS is usually sufficient for this environment
              </span>
            </>
          ) : scenario.riskLevel === "medium" ? (
            <>
              <Shield className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-amber-600">
                HTTPS recommended, VPN for sensitive activities
              </span>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                VPN strongly recommended in addition to HTTPS
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-scenario-selector">
            <Map className="w-4 h-4 mr-2" />
            Scenarios
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Network Scenarios
          </DialogTitle>
          <DialogDescription>
            Explore different network environments and their security implications
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
