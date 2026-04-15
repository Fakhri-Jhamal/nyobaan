import { createBrowserRouter } from "react-router";
import { Navbar } from "./components/Navbar";
import { Outlet } from "react-router";
import { HomePage } from "./pages/HomePage";
import { CommunityPage } from "./pages/CommunityPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { CreatePostPage } from "./pages/CreatePostPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { CreateCommunityPage } from "./pages/CreateCommunityPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminPosts } from "./pages/admin/AdminPosts";
import { AdminCommunities } from "./pages/admin/AdminCommunities";
import { AdminReports } from "./pages/admin/AdminReports";
import { CommunitiesPage } from "./pages/CommunitiesPage";
import { SavedPage } from "./pages/SavedPage";
import { SettingsPage } from "./pages/SettingsPage";
import { HelpPage } from "./pages/HelpPage";
import { RulesPage } from "./pages/RulesPage";

function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Outlet />
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-32 text-center">
      <div className="text-8xl mb-4">🔭</div>
      <h1 className="text-gray-800 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">Sorry, we couldn't find what you were looking for.</p>
      <a href="/" className="px-5 py-2.5 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors">
        Go Home
      </a>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "r/:communityName", Component: CommunityPage },
      { path: "r/:communityName/post/:postId", Component: PostDetailPage },
      { path: "submit", Component: CreatePostPage },
      { path: "create-community", Component: CreateCommunityPage },
      { path: "u/:username", Component: UserProfilePage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "communities", Component: CommunitiesPage },
      { path: "saved", Component: SavedPage },
      { path: "settings", Component: SettingsPage },
      { path: "help", Component: HelpPage },
      { path: "rules", Component: RulesPage },
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminOverview },
          { path: "users", Component: AdminUsers },
          { path: "posts", Component: AdminPosts },
          { path: "communities", Component: AdminCommunities },
          { path: "reports", Component: AdminReports },
        ],
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
