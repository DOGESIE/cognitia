import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getLanguageModel } from "@/lib/ai/providers";
import { saveMCQQuestion } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

export const maxDuration = 60;

const mcqSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("The question text"),
      options: z.array(z.string()).length(4).describe("Four answer options"),
      correctAnswer: z.number().min(0).max(3).describe("Index of the correct answer (0-3)"),
      explanation: z.string().describe("Brief explanation of why the answer is correct"),
    })
  ),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const { topic, difficulty, numQuestions, userId } = await request.json();

    if (!topic || !userId) {
      return new ChatbotError("bad_request:api").toResponse();
    }

    const result = await generateObject({
      model: getLanguageModel("openai/gpt-4o-mini"),
      schema: mcqSchema,
      prompt: `Generate ${numQuestions || 5} multiple choice questions about "${topic}" at ${difficulty || "medium"} difficulty level.
      
Each question should:
- Be clear and unambiguous
- Have exactly 4 answer options (A, B, C, D)
- Have only one correct answer
- Include a brief explanation for why the answer is correct

Make the questions educational and progressively challenging within the ${difficulty || "medium"} difficulty range.`,
    });

    const savedQuestions = await Promise.all(
      result.object.questions.map(async (q) => {
        const [saved] = await saveMCQQuestion({
          userId,
          topic,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer.toString(),
          explanation: q.explanation,
          difficulty: difficulty || "medium",
        });
        return saved;
      })
    );

    return Response.json(savedQuestions, { status: 200 });
  } catch (error) {
    console.error("Error generating MCQ questions:", error);
    return new ChatbotError("offline:chat").toResponse();
  }
}
