"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { QuestionType, QuestionOption } from "@/lib/types";

export async function createQuestion(
  surveyId: string,
  data: {
    type: QuestionType;
    title: string;
    description?: string;
    required?: boolean;
    options?: QuestionOption[];
    config?: Record<string, unknown>;
  }
) {
  const maxOrder = await prisma.question.aggregate({
    where: { surveyId },
    _max: { order: true },
  });

  await prisma.question.create({
    data: {
      surveyId,
      type: data.type,
      title: data.title,
      description: data.description || "",
      required: data.required ?? true,
      order: (maxOrder._max.order ?? -1) + 1,
      options: JSON.stringify(data.options || []),
      config: JSON.stringify(data.config || {}),
    },
  });

  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function updateQuestion(
  questionId: string,
  surveyId: string,
  data: {
    type: QuestionType;
    title: string;
    description?: string;
    required?: boolean;
    options?: QuestionOption[];
    config?: Record<string, unknown>;
  }
) {
  await prisma.question.update({
    where: { id: questionId },
    data: {
      type: data.type,
      title: data.title,
      description: data.description || "",
      required: data.required ?? true,
      options: JSON.stringify(data.options || []),
      config: JSON.stringify(data.config || {}),
    },
  });

  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function deleteQuestion(questionId: string, surveyId: string) {
  await prisma.question.delete({
    where: { id: questionId },
  });

  revalidatePath(`/admin/surveys/${surveyId}`);
}

export async function reorderQuestions(
  surveyId: string,
  orderedIds: string[]
) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.question.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  revalidatePath(`/admin/surveys/${surveyId}`);
}
