"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { SubjectiveQuestion } from "@/lib/db/schema";
import { Loader2, Sparkles, Send, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface SubjectiveContentProps {
  initialQuestions: SubjectiveQuestion[];
  userId: string;
}

export function SubjectiveContent({ initialQuestions, userId }: SubjectiveContentProps) {
  const [questions, setQuestions] = useState<SubjectiveQuestion[]>(initialQuestions);
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<SubjectiveQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateQuestion = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/subjective/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate question");
      }

      const newQuestion = await response.json();
      setQuestions((prev) => [newQuestion, ...prev]);
      setActiveQuestion(newQuestion);
      setUserAnswer("");
      toast.success("Question generated!");
    } catch (error) {
      toast.error("Failed to generate question. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!activeQuestion || !userAnswer.trim()) {
      toast.error("Please write your answer");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/subjective/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: activeQuestion.id,
          question: activeQuestion.question,
          modelAnswer: activeQuestion.modelAnswer,
          userAnswer,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate answer");
      }

      const result = await response.json();

      // Update local state
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === activeQuestion.id
            ? { ...q, userAnswer, feedback: result.feedback, score: result.score }
            : q
        )
      );

      setActiveQuestion((prev) =>
        prev ? { ...prev, userAnswer, feedback: result.feedback, score: result.score } : null
      );

      toast.success("Answer evaluated!");
    } catch (error) {
      toast.error("Failed to evaluate answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectQuestion = (question: SubjectiveQuestion) => {
    setActiveQuestion(question);
    setUserAnswer(question.userAnswer || "");
  };

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold text-foreground">Subjective Practice</h1>
        <p className="text-sm text-muted-foreground">
          Generate open-ended questions and get AI feedback on your answers
        </p>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Question Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-chart-4" />
                Generate Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Climate Change, Machine Learning, Renaissance Art"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <Button
                  onClick={generateQuestion}
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

          {/* Active Question */}
          {activeQuestion && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{activeQuestion.topic}</Badge>
                  {activeQuestion.score && (
                    <Badge 
                      className={
                        parseInt(activeQuestion.score) >= 80
                          ? "bg-chart-2 text-chart-2-foreground"
                          : parseInt(activeQuestion.score) >= 50
                          ? "bg-chart-4 text-chart-4-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }
                    >
                      Score: {activeQuestion.score}%
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-2">{activeQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="answer">Your Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Write your detailed answer here..."
                    className="min-h-32 mt-1"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={!!activeQuestion.feedback}
                  />
                </div>

                {!activeQuestion.feedback && (
                  <div className="flex justify-end">
                    <Button onClick={submitAnswer} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Answer
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {activeQuestion.feedback && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        AI Feedback
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                        {activeQuestion.feedback}
                      </p>
                    </div>

                    {activeQuestion.modelAnswer && (
                      <div className="p-4 bg-chart-2/5 border border-chart-2/20 rounded-lg">
                        <p className="text-sm font-medium text-foreground">Model Answer</p>
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                          {activeQuestion.modelAnswer}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActiveQuestion(null);
                          setUserAnswer("");
                        }}
                      >
                        Try Another Question
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Question History */}
          {questions.length > 0 && !activeQuestion && (
            <Card>
              <CardHeader>
                <CardTitle>Question History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {questions.slice(0, 10).map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => selectQuestion(q)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                          {q.question}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{q.topic}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {q.score ? (
                          <Badge
                            className={
                              parseInt(q.score) >= 80
                                ? "bg-chart-2/10 text-chart-2"
                                : parseInt(q.score) >= 50
                                ? "bg-chart-4/10 text-chart-4"
                                : "bg-destructive/10 text-destructive"
                            }
                          >
                            {q.score}%
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not answered</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {questions.length === 0 && !activeQuestion && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground">No questions yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter a topic above and generate your first subjective question
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
