import { getSurvey } from "@/actions/survey-actions";
import { notFound } from "next/navigation";
import ResultsViewer from "@/components/survey/results-viewer";

export default async function ResultsPage({ params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await params;
  const survey = await getSurvey(surveyId);
  if (!survey) notFound();

  return <ResultsViewer survey={survey} />;
}
