-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'CAREGIVER', 'GUEST');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('NOTE', 'SLEEP', 'MEAL', 'SYMPTOM', 'ACTIVITY', 'MEDICATION');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO', 'AUDIO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_profiles" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_profile_members" (
    "id" TEXT NOT NULL,
    "careProfileId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CAREGIVER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "care_profile_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" TEXT NOT NULL,
    "careProfileId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "EntryType" NOT NULL,
    "freeText" TEXT NOT NULL,
    "moodScore" INTEGER,
    "tags" JSONB,
    "structuredPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" TEXT NOT NULL,
    "careProfileId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "spacesKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_summaries" (
    "id" TEXT NOT NULL,
    "careProfileId" TEXT NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "summaryText" TEXT NOT NULL,
    "insightsJson" JSONB NOT NULL,
    "modelName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "care_profiles_ownerId_name_key" ON "care_profiles"("ownerId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "care_profile_members_careProfileId_userId_key" ON "care_profile_members"("careProfileId", "userId");

-- CreateIndex
CREATE INDEX "entries_careProfileId_timestamp_idx" ON "entries"("careProfileId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ai_summaries_careProfileId_periodType_periodStart_periodEnd_key" ON "ai_summaries"("careProfileId", "periodType", "periodStart", "periodEnd");

-- AddForeignKey
ALTER TABLE "care_profiles" ADD CONSTRAINT "care_profiles_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_profile_members" ADD CONSTRAINT "care_profile_members_careProfileId_fkey" FOREIGN KEY ("careProfileId") REFERENCES "care_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_profile_members" ADD CONSTRAINT "care_profile_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_careProfileId_fkey" FOREIGN KEY ("careProfileId") REFERENCES "care_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_careProfileId_fkey" FOREIGN KEY ("careProfileId") REFERENCES "care_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_careProfileId_fkey" FOREIGN KEY ("careProfileId") REFERENCES "care_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
