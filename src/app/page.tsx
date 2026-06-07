import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">FlexiSurvey</h1>
        <p className="text-gray-500 text-lg">Self-hosted survey and questionnaire system</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/admin/surveys"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  );
}
