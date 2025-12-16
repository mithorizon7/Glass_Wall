import { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  category: "http" | "https" | "vpn" | "general";
  correctIndex: number;
}

const QUESTIONS: Question[] = [
  { id: "q1", category: "http", correctIndex: 1 },
  { id: "q2", category: "https", correctIndex: 1 },
  { id: "q3", category: "vpn", correctIndex: 2 },
  { id: "q4", category: "general", correctIndex: 1 },
  { id: "q5", category: "https", correctIndex: 2 },
  { id: "q6", category: "general", correctIndex: 1 },
  { id: "q7", category: "vpn", correctIndex: 1 },
  { id: "q8", category: "http", correctIndex: 1 },
];

interface QuizModeProps {
  trigger?: React.ReactNode;
}

export function QuizMode({ trigger }: QuizModeProps) {
  const { t } = useTranslation("glassWall");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(QUESTIONS.length).fill(null));
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;

  const questionText = t(`quiz.questions.${currentQuestion.id}.question`);
  const optionsArray = t(`quiz.questions.${currentQuestion.id}.options`, { returnObjects: true }) as string[];
  const explanationText = t(`quiz.questions.${currentQuestion.id}.explanation`);

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
            {t("quizButton")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            {t("quiz.title")}
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
                  {t("quiz.question")} {currentQuestionIndex + 1} {t("quiz.of")} {QUESTIONS.length}
                </span>
                <span className="font-medium text-foreground">
                  {t("quiz.score")}: {score}/{answers.filter(a => a !== null).length}
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
                {questionText}
              </h3>

              <div className="space-y-2">
                {Array.isArray(optionsArray) && optionsArray.map((option: string, index: number) => {
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
                      {isCorrect ? t("quiz.correct") : t("quiz.incorrect")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {explanationText}
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
                    {t("quiz.nextQuestion")}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    {t("quiz.seeResults")}
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
                {score} {t("quiz.of")} {QUESTIONS.length}
              </h3>
              <p className="text-muted-foreground">
                {t("quiz.quizComplete")}
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
                    title={`${t("quiz.question")} ${index + 1}`}
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
              {t("quiz.tryAgain")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
