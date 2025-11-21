import { useEffect } from "react";

const PageMeta = ({ title, description }) => {
  useEffect(() => {
    if (!title && !description) return;

    const previousTitle = document.title;
    const metaTag =
      document.querySelector("meta[name='description']") ||
      (() => {
        const tag = document.createElement("meta");
        tag.setAttribute("name", "description");
        document.head.appendChild(tag);
        return tag;
      })();

    const previousDescription = metaTag.getAttribute("content");

    if (title) {
      document.title = title;
    }

    if (description) {
      metaTag.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;
      metaTag.setAttribute("content", previousDescription || "");
    };
  }, [title, description]);

  return null;
};

export default PageMeta;
