"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface SubjectiveQuestion {
  id: number;
  question: string;
  hints?: string[];
  sampleAnswer?: string;
  maxWords?: number;
}

// Sample questions - these would typically come from an API or database
const sampleQuestions: SubjectiveQuestion[] = [
  {
    id: 1,
    question: "Explain the water cycle and its importance for life on Earth.",
    hints: [
      "Include evaporation, condensation, and precipitation",
      "Mention how it affects different ecosystems",
      "Discuss its role in climate regulation"
    ],
    sampleAnswer: "The water cycle, also known as the hydrological cycle, is a continuous process where water evaporates from oceans and lakes, rises into the atmosphere where it condenses to form clouds, and falls back to Earth as precipitation. This cycle is crucial for life on Earth as it distributes fresh water across the planet, maintains ecosystems, and helps regulate global temperatures.",
    maxWords: 300,
  },
  {
    id: 2,
    question: "What are the main causes and effects of climate change?",
    hints: [
      "Discuss greenhouse gas emissions",
      "Mention human activities contributing to climate change",
      "Describe environmental and social impacts"
    ],
    sampleAnswer: "Climate change is primarily caused by the increased emission of greenhouse gases like CO2 and methane from burning fossil fuels, deforestation, and industrial processes. Effects include rising global temperatures, melting ice caps, sea level rise, extreme weather events, and threats to biodiversity and human health.",
    maxWords: 400,
  },
  {
    id: 3,
    question: "Describe the importance of biodiversity and discuss ways to protect it.",
    hints: [
      "Explain what biodiversity means",
      "Discuss ecosystem services",
      "Suggest conservation strategies"
    ],
    sampleAnswer: "Biodiversity refers to the variety of life on Earth at all levels - genetic, species, and ecosystem. It's crucial for ecosystem stability, food security, medicine, and economic value. Protection strategies include establishing protected areas, sustainable resource use, combating invasive species, and addressing climate change.",
    maxWords: 350,
  },
  {
    id: 4,
    question: "Discuss the impact of technology on modern education.",
    hints: [
      "Consider both positive and negative aspects",
      "Include examples of educational technology",
      "Discuss accessibility and equity issues"
    ],
    sampleAnswer: "Technology has transformed education through online learning platforms, digital resources, and interactive tools that make learning more engaging and accessible. However, it also raises concerns about screen time, digital divide, and the need for digital literacy. The key is finding balance and ensuring equitable access.",
    maxWords: 350,
  },
  {
    id: 5,
    question: "Explain the principles of sustainable development and why it matters.",
    hints: [
      "Define sustainable development",
      "Discuss the three pillars: economic, social, environmental",
      "Give examples of sustainable practices"
    ],
    sampleAnswer: "Sustainable development meets present needs without compromising future generations' ability to meet theirs. It balances economic growth, social inclusion, and environmental protection. Examples include renewable energy, sustainable agriculture, and circular economy practices. It matters because current consumption patterns are depleting resources and harming ecosystems.",
    maxWords: 400,
  },
];

export default function SubjectivePage() {
  const [questions, setQuestions] = useState<SubjectiveQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showSampleAnswer, setShowSampleAnswer] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean[]>([]);

  useEffect(() => {
    setQuestions(sampleQuestions);
    setAnswers(new Array(sampleQuestions.length).fill(""));
    setIsSubmitted(new Array(sampleQuestions.length).fill(false));
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex] || "";
  const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;

  const handleAnswerChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmitAnswer = () => {
    const newIsSubmitted = [...isSubmitted];
    newIsSubmitted[currentQuestionIndex] = true;
    setIsSubmitted(newIsSubmitted);
    setShowSampleAnswer(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowSampleAnswer(isSubmitted[currentQuestionIndex + 1]);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowSampleAnswer(isSubmitted[currentQuestionIndex - 1]);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Array(questions.length).fill(""));
    setIsSubmitted(new Array(questions.length).fill(false));
    setShowSampleAnswer(false);
  };

  const completedCount = isSubmitted.filter(Boolean).length;

  if (questions.length === 0) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Subjective Practice</h1>
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
        <div className="mt-2 flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentQuestionIndex(index);
                setShowSampleAnswer(isSubmitted[index]);
              }}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                index === currentQuestionIndex
                  ? "bg-primary"
                  : isSubmitted[index]
                  ? "bg-green-500"
                  : answers[index]
                  ? "bg-yellow-500"
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </header>

      <main className="flex flex-1 flex-col p-4">
        <Card className="mx-auto w-full max-w-3xl flex-1 p-6">
          <div className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Question {currentQuestionIndex + 1}
              </span>
              {isSubmitted[currentQuestionIndex] && (
                <span className="inline-block rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-600">
                  Submitted
                </span>
              )}
            </div>
            <h2 className="text-xl font-medium">{currentQuestion.question}</h2>
          </div>

          {currentQuestion.hints && currentQuestion.hints.length > 0 && (
            <div className="mb-4 rounded-lg border bg-muted/30 p-4">
              <p className="mb-2 text-sm font-medium">Hints:</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {currentQuestion.hints.map((hint, index) => (
                  <li key={index}>{hint}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Your Answer:</label>
              <span
                className={cn(
                  "text-sm",
                  currentQuestion.maxWords && wordCount > currentQuestion.maxWords
                    ? "text-red-500"
                    : "text-muted-foreground"
                )}
              >
                {wordCount} / {currentQuestion.maxWords || 500} words
              </span>
            </div>
            <Textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Type your answer here..."
              className="min-h-[200px] resize-none"
              disabled={isSubmitted[currentQuestionIndex]}
            />
          </div>

          {showSampleAnswer && currentQuestion.sampleAnswer && (
            <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
              <p className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
                Sample Answer:
              </p>
              <p className="text-sm text-muted-foreground">
                {currentQuestion.sampleAnswer}
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
              {!isSubmitted[currentQuestionIndex] ? (
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim()}
                >
                  Submit Answer
                </Button>
              ) : (
                <>
                  {!showSampleAnswer && currentQuestion.sampleAnswer && (
                    <Button variant="outline" onClick={() => setShowSampleAnswer(true)}>
                      Show Sample Answer
                    </Button>
                  )}
                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button onClick={handleNextQuestion}>Next Question</Button>
                  ) : (
                    <Button onClick={handleRestart}>Start Over</Button>
                  )}
                </>
              )}
            </div>
          </div>
        </Card>

        <div className="mx-auto mt-4 w-full max-w-3xl">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Progress: {completedCount} of {questions.length} questions answered
              </div>
              <div className="h-2 flex-1 mx-4 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{
                    width: `${(completedCount / questions.length) * 100}%`,
                  }}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={handleRestart}>
                Reset All
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
