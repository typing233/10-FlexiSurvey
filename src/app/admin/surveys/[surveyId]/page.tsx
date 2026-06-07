import { getSurvey } from "@/actions/survey-actions";
import { notFound } from "next/navigation";
import SurveyEditor from "@/components/survey/survey-editor";

export default async function SurveyDetailPage({ params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await params;
  const survey = await getSurvey(surveyId);
  if (!survey) notFound();

  return <SurveyEditor survey={survey} />;
}
