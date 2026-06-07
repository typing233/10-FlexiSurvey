import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SurveyFillForm } from "@/components/survey/survey-fill-form";

export default async function PublicSurveyPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!survey || survey.status !== "published") {
    notFound();
  }

  const questions = survey.questions.map((q) => ({
    id: q.id,
    type: q.type,
    title: q.title,
    description: q.description,
    required: q.required,
    options: q.options,
  }));

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-2xl font-bold">{survey.title}</h1>
          {survey.description && (
            <p className="text-muted-foreground mt-2">{survey.description}</p>
          )}
        </div>
        <SurveyFillForm surveyId={surveyId} questions={questions} />
      </div>
    </div>
  );
}
