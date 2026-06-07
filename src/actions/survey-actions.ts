"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createSurvey(formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || "";

  const survey = await prisma.survey.create({
    data: { title, description },
  });

  redirect(`/admin/surveys/${survey.id}`);
}

export async function updateSurvey(surveyId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || "";

  await prisma.survey.update({
    where: { id: surveyId },
    data: { title, description },
  });

  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function publishSurvey(surveyId: string) {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { _count: { select: { questions: true } } },
  });

  if (!survey || survey._count.questions === 0) {
    throw new Error("问卷至少需要一道题目才能发布");
  }

  await prisma.survey.update({
    where: { id: surveyId },
    data: { status: "published" },
  });

  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/admin/surveys");
}

export async function closeSurvey(surveyId: string) {
  await prisma.survey.update({
    where: { id: surveyId },
    data: { status: "closed" },
  });

  revalidatePath(`/admin/surveys/${surveyId}`);
  revalidatePath("/admin/surveys");
}

export async function deleteSurvey(surveyId: string) {
  await prisma.survey.delete({
    where: { id: surveyId },
  });

  revalidatePath("/admin/surveys");
}
