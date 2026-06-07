"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addQuestion(
  surveyId: string,
  data: { type: string; title: string; required: boolean; options?: string[] }
) {
  const maxOrder = await prisma.question.aggregate({
    where: { surveyId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? 0) + 1;

  const question = await prisma.question.create({
    data: {
      surveyId,
      type: data.type,
      title: data.title,
      required: data.required,
      order,
      options: data.options ? JSON.stringify(data.options) : null,
    },
  });
  revalidatePath(`/admin/surveys/${surveyId}`);
  return question;
}

export async function updateQuestion(
  id: string,
  surveyId: string,
  data: { type?: string; title?: string; required?: boolean; options?: string[]; order?: number }
) {
  const updateData: Record<string, unknown> = {};
  if (data.type !== undefined) updateData.type = data.type;
  if (data.title !== undefined) updateData.title = data.title;
  if (data.required !== undefined) updateData.required = data.required;
  if (data.order !== undefined) updateData.order = data.order;
  if (data.options !== undefined) updateData.options = JSON.stringify(data.options);

  const question = await prisma.question.update({
    where: { id },
    data: updateData,
  });
  revalidatePath(`/admin/surveys/${surveyId}`);
  return question;
}

export async function deleteQuestion(id: string, surveyId: string) {
  await prisma.question.delete({ where: { id } });
  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function addSkipRule(
  questionId: string,
  surveyId: string,
  data: { condition: string; targetQuestionOrder: number }
) {
  const rule = await prisma.skipRule.create({
    data: {
      questionId,
      condition: data.condition,
      targetQuestionOrder: data.targetQuestionOrder,
    },
  });
  revalidatePath(`/admin/surveys/${surveyId}`);
  return rule;
}

export async function deleteSkipRule(id: string, surveyId: string) {
  await prisma.skipRule.delete({ where: { id } });
  revalidatePath(`/admin/surveys/${surveyId}`);
}
