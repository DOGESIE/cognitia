"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MCQQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Sample questions - these would typically come from an API or database
const sampleQuestions: MCQQuestion[] = [
  {
    id: 1,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    explanation: "Paris is the capital and most populous city of France.",
  },
  {
    id: 2,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    explanation: "Mars is called the Red Planet due to its reddish appearance caused by iron oxide on its surface.",
  },
  {
    id: 3,
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: 1,
    explanation: "The Blue Whale is the largest animal ever known to have existed.",
  },
  {
    id: 4,
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswer: 1,
    explanation: "William Shakespeare wrote Romeo and Juliet around 1594-1596.",
  },
  {
    id: 5,
    question: "What is the chemical symbol for gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    explanation: "Au comes from the Latin word 'aurum' meaning gold.",
  },
];

export default function MCQPage() {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  useEffect(() => {
    // Load questions - in a real app, this would fetch from an API
    setQuestions(sampleQuestions);
    setAnswers(new Array(sampleQuestions.length).fill(null));
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswered(true);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setIsAnswered(answers[currentQuestionIndex - 1] !== null);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
    setAnswers(new Array(questions.length).fill(null));
  };

  if (questions.length === 0) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading questions...</div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
          <h1 className="text-xl font-semibold">MCQ Results</h1>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center p-4">
          <Card className="w-full max-w-lg p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">Quiz Complete!</h2>
            <div className="mb-6">
              <div className="text-6xl font-bold text-primary">
                {score}/{questions.length}
              </div>
              <p className="mt-2 text-muted-foreground">
                You scored {Math.round((score / questions.length) * 100)}%
              </p>
            </div>
            <div className="space-y-3">
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg border p-3",
                    answers[index] === q.correctAnswer
                      ? "border-green-500 bg-green-500/10"
                      : "border-red-500 bg-red-500/10"
                  )}
                >
                  <span className="text-sm">Question {index + 1}</span>
                  <span className="text-sm font-medium">
                    {answers[index] === q.correctAnswer ? "Correct" : "Incorrect"}
                  </span>
                </div>
              ))}
            </div>
            <Button onClick={handleRestart} className="mt-6 w-full">
              Try Again
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">MCQ Practice</h1>
          <div className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col p-4">
        <Card className="mx-auto w-full max-w-2xl flex-1 p-6">
          <div className="mb-6">
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Question {currentQuestionIndex + 1}
            </span>
            <h2 className="text-xl font-medium">{currentQuestion.question}</h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={isAnswered}
                className={cn(
                  "w-full rounded-lg border p-4 text-left transition-all",
                  "hover:border-primary hover:bg-primary/5",
                  selectedAnswer === index && !isAnswered && "border-primary bg-primary/10",
                  isAnswered && index === currentQuestion.correctAnswer && "border-green-500 bg-green-500/10",
                  isAnswered && selectedAnswer === index && index !== currentQuestion.correctAnswer && "border-red-500 bg-red-500/10",
                  isAnswered && "cursor-default"
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium",
                      selectedAnswer === index && !isAnswered && "border-primary bg-primary text-primary-foreground",
                      isAnswered && index === currentQuestion.correctAnswer && "border-green-500 bg-green-500 text-white",
                      isAnswered && selectedAnswer === index && index !== currentQuestion.correctAnswer && "border-red-500 bg-red-500 text-white"
                    )}
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>

          {isAnswered && currentQuestion.explanation && (
            <div className="mt-6 rounded-lg border bg-muted/50 p-4">
              <p className="text-sm font-medium">Explanation:</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            <div className="flex gap-3">
              {!isAnswered ? (
                <Button onClick={handleSubmitAnswer} disabled={selectedAnswer === null}>
                  Submit Answer
                </Button>
              ) : (
                <Button onClick={handleNextQuestion}>
                  {currentQuestionIndex === questions.length - 1 ? "See Results" : "Next Question"}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
