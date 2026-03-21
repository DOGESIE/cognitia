import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getLanguageModel } from "@/lib/ai/providers";
import { saveSubjectiveQuestion } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

export const maxDuration = 60;

const subjectiveSchema = z.object({
  question: z.string().describe("A thought-provoking open-ended question"),
  modelAnswer: z.string().describe("A comprehensive model answer to the question"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const { topic, userId } = await request.json();

    if (!topic || !userId) {
      return new ChatbotError("bad_request:api").toResponse();
    }

    const result = await generateObject({
      model: getLanguageModel("openai/gpt-4o-mini"),
      schema: subjectiveSchema,
      prompt: `Generate a thought-provoking subjective question about "${topic}" that requires a detailed written response.

The question should:
- Be open-ended and require critical thinking
- Not have a single correct answer but rather require analysis and explanation
- Be at an academic level appropriate for college students or professionals
- Encourage the respondent to draw from multiple aspects of the topic

Also provide a comprehensive model answer (300-500 words) that demonstrates what a high-quality response would look like.`,
    });

    const [saved] = await saveSubjectiveQuestion({
      userId,
      topic,
      question: result.object.question,
      modelAnswer: result.object.modelAnswer,
    });

    return Response.json(saved, { status: 200 });
  } catch (error) {
    console.error("Error generating subjective question:", error);
    return new ChatbotError("offline:chat").toResponse();
  }
}
