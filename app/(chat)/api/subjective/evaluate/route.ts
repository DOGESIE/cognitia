import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";
import { getLanguageModel } from "@/lib/ai/providers";
import { updateSubjectiveAnswer } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

export const maxDuration = 60;

const evaluationSchema = z.object({
  score: z.number().min(0).max(100).describe("Score from 0-100 based on answer quality"),
  feedback: z.string().describe("Detailed constructive feedback on the answer"),
});

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const { questionId, question, modelAnswer, userAnswer } = await request.json();

    if (!questionId || !question || !userAnswer) {
      return new ChatbotError("bad_request:api").toResponse();
    }

    const result = await generateObject({
      model: getLanguageModel("openai/gpt-4o-mini"),
      schema: evaluationSchema,
      prompt: `You are an educational evaluator. Evaluate the following student answer to a subjective question.

Question: ${question}

${modelAnswer ? `Model Answer (for reference): ${modelAnswer}` : ""}

Student's Answer: ${userAnswer}

Please evaluate the student's answer and provide:
1. A score from 0-100 based on:
   - Accuracy and correctness of information (30%)
   - Depth of analysis and critical thinking (30%)
   - Clarity and organization (20%)
   - Completeness and coverage of key points (20%)

2. Detailed constructive feedback that:
   - Highlights what was done well
   - Points out areas for improvement
   - Suggests specific ways to strengthen the answer
   - Is encouraging and educational in tone`,
    });

    await updateSubjectiveAnswer({
      id: questionId,
      userAnswer,
      feedback: result.object.feedback,
      score: result.object.score.toString(),
    });

    return Response.json({
      score: result.object.score.toString(),
      feedback: result.object.feedback,
    }, { status: 200 });
  } catch (error) {
    console.error("Error evaluating subjective answer:", error);
    return new ChatbotError("offline:chat").toResponse();
  }
}
