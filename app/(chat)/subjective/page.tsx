import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import { getSubjectiveQuestionsByUserId } from "@/lib/db/queries";
import { SubjectiveContent } from "@/components/subjective-content";

export default async function SubjectivePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const questions = await getSubjectiveQuestionsByUserId({ userId: session.user.id });

  return <SubjectiveContent initialQuestions={questions} userId={session.user.id} />;
}
