import Link from "next/link";
import { getSurveys } from "@/actions/survey-actions";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  const surveys = await getSurveys();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Surveys</h1>
        <Link
          href="/admin/surveys/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Create Survey
        </Link>
      </div>

      {surveys.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No surveys yet. Create your first survey to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey) => (
            <Link
              key={survey.id}
              href={`/admin/surveys/${survey.id}`}
              className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{survey.title}</h2>
                  {survey.description && (
                    <p className="text-gray-500 text-sm mt-1">{survey.description}</p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">
                    {survey._count.questions} questions · {survey._count.responses} responses
                  </p>
                </div>
                <Badge variant={survey.isPublished ? "default" : "secondary"}>
                  {survey.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
