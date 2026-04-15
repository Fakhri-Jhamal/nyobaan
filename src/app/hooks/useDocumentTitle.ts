import { useEffect } from "react";

export function useDocumentTitle(title: string, fallbackTitle = "ForumHub") {
  useEffect(() => {
    document.title = title ? `${title} - ${fallbackTitle}` : fallbackTitle;
    return () => {
      document.title = fallbackTitle;
    };
  }, [title, fallbackTitle]);
}
