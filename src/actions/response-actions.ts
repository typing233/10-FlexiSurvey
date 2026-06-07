"use server";

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { generateRespondentId } from "@/lib/hash";
import { redirect } from "next/navigation";
import { QuestionOption } from "@/lib/types";

export async function submitResponse(
  surveyId: string,
  answers: Record<string, string | string[]>
) {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: { questions: true },
  });

  if (!survey || survey.status !== "published") {
    throw new Error("问卷不存在或未发布");
  }

  for (const question of survey.questions) {
    if (question.required) {
      const answer = answers[question.id];
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        throw new Error(`请回答必填题目: ${question.title}`);
      }
    }
  }

  for (const question of survey.questions) {
    const answer = answers[question.id];
    if (!answer) continue;

    if (question.type === "single_choice") {
      const options: QuestionOption[] = JSON.parse(question.options);
      const validIds = options.map((o) => o.id);
      if (!validIds.includes(answer as string)) {
        throw new Error("无效的选项");
      }
    }

    if (question.type === "multiple_choice") {
      const options: QuestionOption[] = JSON.parse(question.options);
      const validIds = options.map((o) => o.id);
      const selected = answer as string[];
      if (!selected.every((id) => validIds.includes(id))) {
        throw new Error("无效的选项");
      }
    }
  }

  const headersList = await headers();
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";
  const respondentId = generateRespondentId(ip);

  await prisma.response.create({
    data: {
      surveyId,
      respondentId,
      answers: {
        create: survey.questions
          .filter((q) => answers[q.id] !== undefined)
          .map((q) => ({
            questionId: q.id,
            value: JSON.stringify(answers[q.id]),
          })),
      },
    },
  });

  redirect(`/s/${surveyId}/success`);
}
