/**
 * Auth Form Hooks
 * Custom hooks that encapsulate form logic and state management
 */
import { useState, useCallback } from "react";
import { useAuth } from "../context";
import { validateSignUpForm } from "../domain/validators";
import { createSignUpData } from "../domain/types";
import {
  createErrorMessage,
  shouldShowAsFieldError,
  getFieldErrors,
  getToastMessage,
} from "../domain/errorHandler";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// Sign Up Form Hook
export const useSignUpForm = () => {
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(createSignUpData());
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setErrors({});

      // Validate form
      const validation = validateSignUpForm(formData, acceptTerms);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsLoading(false);
        return;
      }

      try {
        const result = await signup({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        });

        if (result.success) {
          // Show success message
          const message = result.needsConfirmation
            ? "Registration successful! Please check your email to verify your account before signing in."
            : "Registration successful! You can now sign in.";

          toast.success(message, { autoClose: 4000 });

          // Clear form
          setFormData(createSignUpData());
          setAcceptTerms(false);

          // Redirect to signin
          setTimeout(() => {
            navigate("/signin", { replace: true });
          }, 2500);
        }
      } catch (error) {
        console.error("Sign up failed:", error);

        if (shouldShowAsFieldError(error)) {
          setErrors(getFieldErrors(error));
        } else {
          const toastMessage = getToastMessage(error);
          if (toastMessage) {
            toast.error(toastMessage);
          }
          const errorMessage = createErrorMessage(error);
          setErrors({ submit: errorMessage.message });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, acceptTerms, signup, navigate]
  );

  const handleGoogleSignUp = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await signInWithGoogle();
      if (result.success) {
        toast.success("Google sign up successful!");
      }
    } catch (error) {
      console.error("Google sign up failed:", error);
      toast.error("Google sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle]);

  return {
    formData,
    errors,
    isLoading,
    acceptTerms,
    handleChange,
    handleSubmit,
    handleGoogleSignUp,
    setAcceptTerms,
  };
};
