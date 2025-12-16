import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  HelpCircle,
  CheckCircle,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Lock,
  Unlock,
  Shield,
  Eye,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: "http" | "https" | "vpn" | "general";
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "When you connect to a website using HTTP, who can see your password?",
    options: [
      "Only the website you're connecting to",
      "Anyone on the same network",
      "Only your internet service provider",
      "Nobody can see it",
    ],
    correctIndex: 1,
    explanation: "With HTTP, data is transmitted in plain text. Anyone on the same network (like a coffee shop Wi-Fi) can intercept and read your password using simple tools.",
    category: "http",
  },
  {
    id: "q2",
    question: "What does the 'S' in HTTPS stand for?",
    options: [
      "Speed",
      "Secure",
      "Server",
      "Standard",
    ],
    correctIndex: 1,
    explanation: "HTTPS stands for HyperText Transfer Protocol Secure. The 'S' indicates that the connection uses encryption (TLS/SSL) to protect data in transit.",
    category: "https",
  },
  {
    id: "q3",
    question: "Which of the following can a VPN hide from your local network?",
    options: [
      "Only your passwords",
      "Only the websites you visit",
      "Both your passwords and the websites you visit",
      "Neither - VPNs don't hide anything",
    ],
    correctIndex: 2,
    explanation: "A VPN creates an encrypted tunnel for ALL your traffic. This hides both the content (passwords, data) and metadata (which websites you visit) from local observers.",
    category: "vpn",
  },
  {
    id: "q4",
    question: "You're at a coffee shop and need to check your bank account. What should you do?",
    options: [
      "Connect to the free Wi-Fi and log in normally",
      "Make sure the bank website uses HTTPS, or use cellular data",
      "Ask the barista for the Wi-Fi password first",
      "Use an incognito/private browser window",
    ],
    correctIndex: 1,
    explanation: "For sensitive activities like banking, ensure the site uses HTTPS (look for the lock icon). Better yet, use your phone's cellular data instead of public Wi-Fi. Incognito mode doesn't protect network traffic.",
    category: "general",
  },
  {
    id: "q5",
    question: "When using HTTPS, what can your ISP still see?",
    options: [
      "Your passwords and form data",
      "The content of emails you send",
      "Which websites you visit (but not the specific pages or content)",
      "Everything you do online",
    ],
    correctIndex: 2,
    explanation: "HTTPS encrypts the content of your communication, but your ISP can still see which domains (websites) you connect to. This is called 'metadata'. To hide this, you would need a VPN.",
    category: "https",
  },
  {
    id: "q6",
    question: "What's the main risk of a 'fake hotspot' attack?",
    options: [
      "Slow internet speeds",
      "An attacker can see all your unencrypted traffic",
      "Your phone battery drains faster",
      "You get charged for Wi-Fi usage",
    ],
    correctIndex: 1,
    explanation: "In a fake hotspot (evil twin) attack, an attacker creates a network that mimics a legitimate one. All your traffic passes through their equipment, allowing them to intercept unencrypted data and even perform man-in-the-middle attacks.",
    category: "general",
  },
  {
    id: "q7",
    question: "Which statement about VPNs is TRUE?",
    options: [
      "VPNs make you completely anonymous online",
      "VPNs slow down your internet but hide your traffic from local observers",
      "VPNs only work with HTTPS websites",
      "VPNs prevent all types of cyber attacks",
    ],
    correctIndex: 1,
    explanation: "VPNs add a layer of encryption that may slightly slow your connection, but they effectively hide your traffic from your local network and ISP. However, the VPN provider can still see your traffic, and VPNs don't prevent phishing or malware.",
    category: "vpn",
  },
  {
    id: "q8",
    question: "You notice a website doesn't have a lock icon in the address bar. What does this mean?",
    options: [
      "The website is using HTTP and your data is not encrypted",
      "The website is slow",
      "The website is blocked by your firewall",
      "Your browser is outdated",
    ],
    correctIndex: 0,
    explanation: "The lock icon indicates HTTPS (encrypted connection). Without it, the site is using HTTP, meaning any data you submit (passwords, forms) can be intercepted by anyone on your network.",
    category: "http",
  },
];

interface QuizModeProps {
  trigger?: React.ReactNode;
}

export function QuizMode({ trigger }: QuizModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(QUESTIONS.length).fill(null));
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;

  const score = useMemo(() => {
    return answers.reduce<number>((acc, answer, index) => {
      return acc + (answer === QUESTIONS[index].correctIndex ? 1 : 0);
    }, 0);
  }, [answers]);

  const handleSelectAnswer = useCallback((index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    setAnswers(prev => {
      const next = [...prev];
      next[currentQuestionIndex] = index;
      return next;
    });
  }, [selectedAnswer, currentQuestionIndex]);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setIsComplete(true);
    }
  }, [currentQuestionIndex]);

  const handleRestart = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers(new Array(QUESTIONS.length).fill(null));
    setIsComplete(false);
  }, []);

  const progressPercent = ((currentQuestionIndex + (selectedAnswer !== null ? 1 : 0)) / QUESTIONS.length) * 100;

  const getCategoryIcon = (category: Question["category"]) => {
    switch (category) {
      case "http": return <Unlock className="w-3 h-3" />;
      case "https": return <Lock className="w-3 h-3" />;
      case "vpn": return <Shield className="w-3 h-3" />;
      default: return <Eye className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: Question["category"]) => {
    switch (category) {
      case "http": return "bg-red-500/10 text-red-600";
      case "https": return "bg-green-500/10 text-green-600";
      case "vpn": return "bg-purple-500/10 text-purple-600";
      default: return "bg-blue-500/10 text-blue-600";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-quiz-mode">
            <HelpCircle className="w-4 h-4 mr-2" />
            Quiz
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Security Knowledge Quiz
          </DialogTitle>
          <DialogDescription>
            Test your understanding of network security concepts
          </DialogDescription>
        </DialogHeader>

        {!isComplete ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {QUESTIONS.length}
                </span>
                <span className="font-medium text-foreground">
                  Score: {score}/{answers.filter(a => a !== null).length}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Badge className={`text-xs ${getCategoryColor(currentQuestion.category)}`}>
                  {getCategoryIcon(currentQuestion.category)}
                  <span className="ml-1 capitalize">{currentQuestion.category}</span>
                </Badge>
              </div>

              <h3 className="text-lg font-medium text-foreground" data-testid="text-question">
                {currentQuestion.question}
              </h3>

              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => {
                  let variant = "outline";
                  let bgColor = "";
                  let borderColor = "";
                  
                  if (selectedAnswer !== null) {
                    if (index === currentQuestion.correctIndex) {
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
                      className={`w-full justify-start text-left h-auto py-3 px-4 ${bgColor} ${borderColor && `border-2 ${borderColor}`}`}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={selectedAnswer !== null}
                      data-testid={`button-option-${index}`}
                    >
                      <span className="flex items-center gap-3">
                        {selectedAnswer !== null && index === currentQuestion.correctIndex && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        {selectedAnswer !== null && index === selectedAnswer && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        )}
                        {(selectedAnswer === null || (index !== currentQuestion.correctIndex && index !== selectedAnswer)) && (
                          <span className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span>{option}</span>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {showExplanation && (
              <Card className={`p-4 animate-fade-in ${isCorrect ? "bg-green-500/5 border-green-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-medium mb-1 ${isCorrect ? "text-green-600" : "text-amber-600"}`}>
                      {isCorrect ? "Correct!" : "Not quite right"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {selectedAnswer !== null && (
              <Button 
                onClick={handleNext} 
                className="w-full"
                data-testid="button-next-question"
              >
                {currentQuestionIndex < QUESTIONS.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    See Results
                    <Trophy className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6 text-center py-4">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              score >= QUESTIONS.length * 0.8 ? "bg-green-500/10" :
              score >= QUESTIONS.length * 0.5 ? "bg-amber-500/10" :
              "bg-red-500/10"
            }`}>
              <Trophy className={`w-10 h-10 ${
                score >= QUESTIONS.length * 0.8 ? "text-green-500" :
                score >= QUESTIONS.length * 0.5 ? "text-amber-500" :
                "text-red-500"
              }`} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2" data-testid="text-final-score">
                {score} out of {QUESTIONS.length}
              </h3>
              <p className="text-muted-foreground">
                {score >= QUESTIONS.length * 0.8 
                  ? "Excellent! You have a strong understanding of network security."
                  : score >= QUESTIONS.length * 0.5
                  ? "Good effort! Review the explanations to strengthen your knowledge."
                  : "Keep learning! Try exploring the visualizer to better understand these concepts."
                }
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {QUESTIONS.map((q, index) => {
                const answered = answers[index];
                const correct = answered === q.correctIndex;
                return (
                  <div 
                    key={q.id}
                    className={`w-full aspect-square rounded-md flex items-center justify-center ${
                      answered === null ? "bg-muted" :
                      correct ? "bg-green-500/10" : "bg-red-500/10"
                    }`}
                    title={`Question ${index + 1}: ${correct ? "Correct" : "Incorrect"}`}
                  >
                    {answered !== null && (
                      correct 
                        ? <CheckCircle className="w-4 h-4 text-green-500" />
                        : <XCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                );
              })}
            </div>

            <Button onClick={handleRestart} className="w-full" data-testid="button-restart-quiz">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
