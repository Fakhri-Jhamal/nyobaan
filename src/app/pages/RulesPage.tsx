import { AlertTriangle } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function RulesPage() {
  useDocumentTitle("General Rules — ForumHub");

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <AlertTriangle className="w-8 h-8 text-orange-500" />
        <h1 className="text-3xl font-bold text-gray-900">Platform Rules</h1>
      </div>
      
      <div className="bg-white p-6 md:p-8 border border-gray-200 rounded-xl prose max-w-none text-gray-700">
        <p className="mb-6 text-lg">
          Welcome to ForumHub! By using our platform, you agree to abide by the following community guidelines. Failure to comply may result in account suspension or termination.
        </p>

        <ol className="space-y-4 list-decimal pl-5">
          <li className="pl-2">
            <strong>Be Respectful</strong>
            <p className="mt-1 text-sm text-gray-600">Treat everyone with respect. Harassment, bullying, hate speech, and intolerance will not be tolerated. Remember the human behind the screen.</p>
          </li>
          <li className="pl-2">
            <strong>No Spam or Self-Promotion</strong>
            <p className="mt-1 text-sm text-gray-600">The platform is meant for discussion, not for advertising. Do not post repetitive content, irrelevant links, or use the platform solely for self-promotion.</p>
          </li>
          <li className="pl-2">
            <strong>No Illegal Content</strong>
            <p className="mt-1 text-sm text-gray-600">Do not post content that violates local or international laws. This includes copyrighted material, illegal transactions, or inciting violence.</p>
          </li>
          <li className="pl-2">
            <strong>Follow Community-Specific Rules</strong>
            <p className="mt-1 text-sm text-gray-600">Each local community (Sub-forum) has its own set of rules defined by its moderators. You must respect those rules when participating in that specific space.</p>
          </li>
        </ol>

        <p className="mt-8 text-sm italic text-gray-500">
          Last updated: April 2026. Administrators reserve the right to modify these rules at any time without prior notice.
        </p>
      </div>
    </div>
  );
}
