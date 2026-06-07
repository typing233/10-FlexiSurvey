import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SurveyPreview from "@/components/survey/survey-preview";

export default async function PublicSurveyPage({ params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await params;

  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { skipRules: true },
      },
      _count: { select: { responses: true } },
    },
  });

  if (!survey) notFound();

  if (!survey.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Survey Unavailable</h1>
          <p className="text-gray-500 mt-2">This survey is not currently accepting responses.</p>
        </div>
      </div>
    );
  }

  if (survey.maxResponses && survey._count.responses >= survey.maxResponses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Survey Closed</h1>
          <p className="text-gray-500 mt-2">This survey has reached its maximum number of responses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <SurveyPreview survey={survey} />
      </div>
    </div>
  );
}
