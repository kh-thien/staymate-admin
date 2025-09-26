import { useContext } from "react";
import { AuthContext } from "./auth/authContext";

// Custom hook to use AuthContext with Redux
export const useAuthRedux = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthRedux must be used within an AuthProviderRedux");
  }
  return context;
};
