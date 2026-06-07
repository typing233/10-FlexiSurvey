import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/surveys" className="text-xl font-bold text-gray-900">
            FlexiSurvey
          </Link>
          <nav className="flex gap-4">
            <Link href="/admin/surveys" className="text-sm text-gray-600 hover:text-gray-900">
              Surveys
            </Link>
            <Link href="/admin/surveys/new" className="text-sm text-blue-600 hover:text-blue-800">
              + New Survey
            </Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
