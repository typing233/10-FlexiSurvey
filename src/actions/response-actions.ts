"use server";

import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { headers } from "next/headers";

function generateRespondentId(ip: string): string {
  return createHash("sha256").update(ip + "flexi-salt").digest("hex").slice(0, 16);
}

export async function submitResponse(
  surveyId: string,
  answers: { questionId: string; value: string }[]
) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown";
  const respondentId = generateRespondentId(ip);

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { _count: { select: { responses: true } } },
  });

  if (!survey) throw new Error("Survey not found");
  if (!survey.isPublished) throw new Error("Survey is not published");
  if (survey.maxResponses && survey._count.responses >= survey.maxResponses) {
    throw new Error("Survey has reached maximum responses");
  }

  const response = await prisma.response.create({
    data: {
      surveyId,
      respondentId,
      completed: true,
      answers: {
        create: answers.map((a) => ({
          questionId: a.questionId,
          value: a.value,
        })),
      },
    },
  });

  return response;
}

export async function getResponses(
  surveyId: string,
  filters?: { startDate?: string; endDate?: string; completed?: boolean }
) {
  const where: Record<string, unknown> = { surveyId };

  if (filters?.completed !== undefined) {
    where.completed = filters.completed;
  }

  if (filters?.startDate || filters?.endDate) {
    const createdAt: Record<string, Date> = {};
    if (filters.startDate) createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) createdAt.lte = new Date(filters.endDate);
    where.createdAt = createdAt;
  }

  return prisma.response.findMany({
    where,
    include: {
      answers: { include: { question: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
