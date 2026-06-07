import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin/surveys" className="text-lg font-bold">
            FlexiSurvey
          </Link>
          <nav>
            <Link
              href="/admin/surveys"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              问卷管理
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
