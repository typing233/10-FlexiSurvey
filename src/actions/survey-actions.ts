"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSurvey(title: string, description?: string) {
  const survey = await prisma.survey.create({
    data: { title, description },
  });
  return survey;
}

export async function updateSurvey(
  id: string,
  data: { title?: string; description?: string; isPublished?: boolean; maxResponses?: number | null }
) {
  const survey = await prisma.survey.update({
    where: { id },
    data,
  });
  revalidatePath(`/admin/surveys/${id}`);
  return survey;
}

export async function deleteSurvey(id: string) {
  await prisma.survey.delete({ where: { id } });
  revalidatePath("/admin/surveys");
}

export async function getSurveys() {
  return prisma.survey.findMany({
    include: { _count: { select: { responses: true, questions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSurvey(id: string) {
  return prisma.survey.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { skipRules: true },
      },
      _count: { select: { responses: true } },
    },
  });
}
