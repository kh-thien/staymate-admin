import { useContext } from "react";
import AppLayoutContext from "./appLayoutContext";

export const useAppLayout = () => {
  const context = useContext(AppLayoutContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
