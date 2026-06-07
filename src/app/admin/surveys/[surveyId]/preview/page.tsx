import { getSurvey } from "@/actions/survey-actions";
import { notFound } from "next/navigation";
import SurveyPreview from "@/components/survey/survey-preview";

export default async function PreviewPage({ params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await params;
  const survey = await getSurvey(surveyId);
  if (!survey) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Preview: {survey.title}</h1>
      <p className="text-sm text-gray-500 mb-6">This is how the survey will look to respondents.</p>
      <div className="max-w-2xl">
        <SurveyPreview survey={survey} isPreview />
      </div>
    </div>
  );
}
