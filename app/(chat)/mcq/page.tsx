import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import { getMCQQuestionsByUserId } from "@/lib/db/queries";
import { MCQContent } from "@/components/mcq-content";

export default async function MCQPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const questions = await getMCQQuestionsByUserId({ userId: session.user.id });

  return <MCQContent initialQuestions={questions} userId={session.user.id} />;
}
