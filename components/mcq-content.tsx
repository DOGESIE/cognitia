"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { MCQQuestion } from "@/lib/db/schema";
import { Loader2, Sparkles, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface MCQContentProps {
  initialQuestions: MCQQuestion[];
  userId: string;
}

export function MCQContent({ initialQuestions, userId }: MCQContentProps) {
  const [questions, setQuestions] = useState<MCQQuestion[]>(initialQuestions);
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const generateQuestions = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/mcq/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, numQuestions, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const newQuestions = await response.json();
      setQuestions((prev) => [...newQuestions, ...prev]);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
      toast.success(`Generated ${newQuestions.length} questions!`);
    } catch (error) {
      toast.error("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswer = async (answerIndex: number) => {
    if (showResult || currentQuestionIndex === null) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answerIndex === parseInt(currentQuestion.correctAnswer);

    // Update the question in the database
    try {
      await fetch("/api/mcq/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: answerIndex.toString(),
          isCorrect,
        }),
      });

      // Update local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === currentQuestion.id
            ? { ...q, userAnswer: answerIndex.toString(), isCorrect }
            : q
        )
      );
    } catch (error) {
      console.error("Failed to save answer");
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex === null) return;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCurrentQuestionIndex(null);
    }
  };

  const startQuiz = (index: number) => {
    setCurrentQuestionIndex(index);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const currentQuestion = currentQuestionIndex !== null ? questions[currentQuestionIndex] : null;

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold text-foreground">MCQ Practice</h1>
        <p className="text-sm text-muted-foreground">
          Generate and practice multiple choice questions with AI
        </p>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Question Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-chart-4" />
                Generate Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., JavaScript Promises, World War II, Photosynthesis"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <select
                    id="difficulty"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <Label htmlFor="numQuestions">Questions</Label>
                  <Input
                    id="numQuestions"
                    type="number"
                    min={1}
                    max={10}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                  />
                </div>
                <Button
                  onClick={generateQuestions}
                  disabled={isGenerating}
                  className="mt-6"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Quiz */}
          {currentQuestion && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    Question {currentQuestionIndex! + 1} of {questions.length}
                  </Badge>
                  <Badge>{currentQuestion.difficulty}</Badge>
                </div>
                <CardTitle className="text-lg mt-2">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(currentQuestion.options as string[]).map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === parseInt(currentQuestion.correctAnswer);
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border transition-all ${
                        showCorrect
                          ? "border-chart-2 bg-chart-2/10"
                          : showWrong
                          ? "border-destructive bg-destructive/10"
                          : isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {showCorrect && <CheckCircle2 className="h-5 w-5 text-chart-2" />}
                        {showWrong && <XCircle className="h-5 w-5 text-destructive" />}
                      </div>
                    </button>
                  );
                })}

                {showResult && currentQuestion.explanation && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium text-foreground">Explanation:</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}

                {showResult && (
                  <div className="flex justify-end mt-4">
                    <Button onClick={nextQuestion}>
                      {currentQuestionIndex! < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Question History */}
          {questions.length > 0 && !currentQuestion && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Question History</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startQuiz(0)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start Quiz
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questions.slice(0, 10).map((q, index) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => startQuiz(index)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {q.question}
                        </p>
                        <p className="text-xs text-muted-foreground">{q.topic}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline" className="text-xs">
                          {q.difficulty}
                        </Badge>
                        {q.isCorrect !== null && (
                          q.isCorrect ? (
                            <CheckCircle2 className="h-4 w-4 text-chart-2" />
                          ) : (
                            <XCircle className="h-4 w-4 text-destructive" />
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {questions.length === 0 && !currentQuestion && (
            <Card>
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No questions yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a topic above and generate your first set of MCQ questions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
