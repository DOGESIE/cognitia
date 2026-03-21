import { auth } from "@/app/(auth)/auth";
import { redirect } from "next/navigation";
import { getUserById, getUserStats } from "@/lib/db/queries";
import { AccountContent } from "@/components/account-content";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getUserById({ id: session.user.id });
  const stats = await getUserStats({ userId: session.user.id });

  if (!user) {
    redirect("/login");
  }

  return <AccountContent user={user} stats={stats} />;
}
