"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/lib/db/schema";
import { BookOpen, CheckCircle2, MessageSquare, FileText } from "lucide-react";

interface AccountContentProps {
  user: User;
  stats: {
    totalMCQs: number;
    correctMCQs: number;
    totalSubjective: number;
    totalChats: number;
  };
}

export function AccountContent({ user, stats }: AccountContentProps) {
  const accuracyRate = stats.totalMCQs > 0 
    ? Math.round((stats.correctMCQs / stats.totalMCQs) * 100) 
    : 0;

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="border-b border-border px-6 py-4">
        <h1 className="text-2xl font-semibold text-foreground">Account</h1>
        <p className="text-sm text-muted-foreground">
          View your profile and learning statistics
        </p>
      </header>

      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-lg text-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Member since {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-1/10 rounded-lg">
                    <BookOpen className="h-5 w-5 text-chart-1" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalMCQs}</p>
                    <p className="text-sm text-muted-foreground">MCQ Questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-2/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{accuracyRate}%</p>
                    <p className="text-sm text-muted-foreground">MCQ Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-3/10 rounded-lg">
                    <FileText className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalSubjective}</p>
                    <p className="text-sm text-muted-foreground">Subjective Q&A</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-chart-4/10 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-chart-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.totalChats}</p>
                    <p className="text-sm text-muted-foreground">Chat Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">MCQ Performance</span>
                  <span className="text-foreground font-medium">
                    {stats.correctMCQs} / {stats.totalMCQs} correct
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-chart-2 rounded-full transition-all duration-300"
                    style={{ width: `${accuracyRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Questions Attempted</span>
                  <span className="text-foreground font-medium">
                    {stats.totalMCQs + stats.totalSubjective} total
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-chart-1 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (stats.totalMCQs + stats.totalSubjective) * 2)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
