import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900">Thank you!</h1>
        <p className="text-gray-500 mt-2">Your response has been recorded.</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block text-sm">
          Back to home
        </Link>
      </div>
    </div>
  );
}
