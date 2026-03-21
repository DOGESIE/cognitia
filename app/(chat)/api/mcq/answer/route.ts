import { auth } from "@/app/(auth)/auth";
import { updateMCQAnswer } from "@/lib/db/queries";
import { ChatbotError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new ChatbotError("unauthorized:chat").toResponse();
    }

    const { questionId, userAnswer, isCorrect } = await request.json();

    if (!questionId || userAnswer === undefined || isCorrect === undefined) {
      return new ChatbotError("bad_request:api").toResponse();
    }

    await updateMCQAnswer({
      id: questionId,
      userAnswer,
      isCorrect,
    });

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating MCQ answer:", error);
    return new ChatbotError("offline:chat").toResponse();
  }
}
