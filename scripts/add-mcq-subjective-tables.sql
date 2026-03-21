-- Add MCQ Questions table
CREATE TABLE IF NOT EXISTS "MCQQuestion" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "topic" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "options" JSON NOT NULL,
  "correctAnswer" INTEGER NOT NULL,
  "explanation" TEXT,
  "difficulty" VARCHAR(20) DEFAULT 'medium',
  "userAnswer" INTEGER,
  "isCorrect" BOOLEAN,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add Subjective Questions table
CREATE TABLE IF NOT EXISTS "SubjectiveQuestion" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES "User"("id"),
  "topic" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "modelAnswer" TEXT,
  "userAnswer" TEXT,
  "feedback" TEXT,
  "score" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS "mcq_user_idx" ON "MCQQuestion"("userId");
CREATE INDEX IF NOT EXISTS "mcq_topic_idx" ON "MCQQuestion"("topic");
CREATE INDEX IF NOT EXISTS "subjective_user_idx" ON "SubjectiveQuestion"("userId");
CREATE INDEX IF NOT EXISTS "subjective_topic_idx" ON "SubjectiveQuestion"("topic");
