import Dashboard from "../dashboard/pages/dashboard";

import { useAppLayout } from "./context/useAppLayout";

const pageComponents = {
  dashboard: Dashboard,
};

export default function PageContent({ children }) {
  const { activePage } = useAppLayout();

  const PageComponent = pageComponents[activePage];

  if (PageComponent) {
    return <PageComponent />;
  }

  return children;
}
