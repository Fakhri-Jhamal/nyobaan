import { HelpCircle } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export function HelpPage() {
  useDocumentTitle("Help & Support — ForumHub");

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <HelpCircle className="w-8 h-8 text-orange-500" />
        <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
      </div>
      
      <div className="space-y-6">
        <section className="bg-white p-6 border border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-3">How do I create a community?</h2>
          <p className="text-gray-600 leading-relaxed">
            You can create a community by clicking the "+" button on the sidebar. Give it a unique name and a description. Once created, you automatically become the admin of that community and can manage its moderators and rules.
          </p>
        </section>

        <section className="bg-white p-6 border border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-3">How does Karma work?</h2>
          <p className="text-gray-600 leading-relaxed">
            Karma is a reflection of your contribution to ForumHub. You earn Karma when other users upvote your posts and comments. Conversely, you lose Karma when your posts or comments are downvoted. The higher your Karma, the more trusted you appear within the community!
          </p>
        </section>

        <section className="bg-white p-6 border border-gray-200 rounded-xl">
          <h2 className="text-xl font-semibold mb-3">Can I delete my account?</h2>
          <p className="text-gray-600 leading-relaxed">
            Currently, account deletion is handled by system administrators. If you wish to have your account removed, please contact an admin or submit an email to our support team.
          </p>
        </section>
      </div>
    </div>
  );
}
