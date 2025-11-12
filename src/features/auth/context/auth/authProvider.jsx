import React, { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { AuthService } from "../../services/authServices";
import { userService } from "../../services/userService";
import { useNavigate } from "react-router-dom";

// AuthProvider component with Supabase integration
export default function AuthProvider({ children }) {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [isSignupFlow, setIsSignupFlow] = useState(false);
  const [isEmailConfirmation, setIsEmailConfirmation] = useState(false);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Function để check và update role ADMIN cho OAuth user mới
  const checkAndUpdateOAuthUserRole = async (authUser) => {
    try {
      if (!authUser?.id) {
        return;
      }

      // Đợi một chút để trigger tạo user trong database
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check xem user có trong database chưa
      const userExists = await userService.checkUserExists(authUser.id);
      
      if (!userExists) {
        console.log("User not found in database yet, waiting a bit more...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Lấy thông tin user từ database
      const dbUser = await userService.getUserByAuthId(authUser.id);
      
      if (dbUser) {
        // Check xem user có phải là user mới không (created trong vòng 5 phút)
        const createdAt = new Date(dbUser.created_at);
        const now = new Date();
        const minutesDiff = (now - createdAt) / (1000 * 60);
        
        // Nếu user mới được tạo (trong vòng 5 phút) và role là TENANT, update thành ADMIN
        if (minutesDiff <= 5 && dbUser.role === 'TENANT') {
          console.log("🔄 OAuth user detected - updating role to ADMIN");
          await userService.updateUser(authUser.id, { role: 'ADMIN' });
          console.log("✅ Role updated to ADMIN for OAuth user");
        }
      }
    } catch (error) {
      console.error("Error checking/updating OAuth user role:", error);
      // Không throw error để không làm gián đoạn flow đăng nhập
    }
  };

  // Function để lấy thông tin user đầy đủ từ database
  const fetchUserFromDatabase = async (authUser) => {
    try {
      if (!authUser?.id) {
        console.log("No auth user ID, cannot fetch from database");
        return null;
      }

      console.log("Fetching user from database for auth ID:", authUser.id);
      const dbUser = await userService.getUserByAuthId(authUser.id);

      if (dbUser) {
        console.log("User found in database:", dbUser);
        // Kết hợp thông tin từ auth và database
        return {
          ...authUser, // Thông tin từ Supabase Auth
          userid: dbUser.userid, // ID từ database
          fullName: dbUser.full_name,
          email: dbUser.email || authUser.email,
          phone: dbUser.phone,
          role: dbUser.role,
          avatarUrl: dbUser.avatar_url,
          createdAt: dbUser.created_at,
          updatedAt: dbUser.updated_at,
        };
      } else {
        console.log(
          "User not found in database - trigger should have created it"
        );
        // Trigger đã tự động tạo user, chỉ cần đợi một chút và thử lại
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Đợi 1 giây

        try {
          const retryUser = await userService.getUserByAuthId(authUser.id);
          if (retryUser) {
            console.log("User found after retry:", retryUser);
            return {
              ...authUser,
              userid: retryUser.userid,
              fullName: retryUser.full_name,
              email: retryUser.email || authUser.email,
              phone: retryUser.phone,
              role: retryUser.role,
              avatarUrl: retryUser.avatar_url,
              createdAt: retryUser.created_at,
              updatedAt: retryUser.updated_at,
            };
          }
        } catch (retryError) {
          console.error("Error retrying user fetch:", retryError);
        }

        // Fallback to auth user only if database user still not found
        console.log("Using auth user only - database user not found");
        return authUser;
      }
    } catch (error) {
      console.error("Error fetching user from database:", error);
      // Trả về auth user nếu không lấy được từ database
      return authUser;
    }
  };

  // Check if current URL is email confirmation and handle logout + redirect
  useEffect(() => {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", "?")
    );

    // Detect ONLY email confirmation scenarios, not OAuth login
    const isEmailConfirmPage = path === "/confirmed-email";
    const hasEmailConfirmationToken = urlParams.has("token_hash");
    const isPasswordRecovery = hashParams.get("type") === "recovery";

    // Only treat as email confirmation if:
    // 1. On confirmed-email page, OR
    // 2. Has token_hash (email verification)
    // BUT NOT password recovery (which has type=recovery) or OAuth login
    const isEmailConfirmation =
      isEmailConfirmPage || (hasEmailConfirmationToken && !isPasswordRecovery);

    // Only logout and redirect if NOT already on confirmed-email page
    // If already on confirmed-email page, let the page handle its own logic
    if (isEmailConfirmation && !isEmailConfirmPage) {
      console.log(
        "🔍 Email confirmation detected - redirecting to confirmed-email page:",
        {
          path,
          urlParams: Object.fromEntries(urlParams),
          hashParams: Object.fromEntries(hashParams),
          isEmailConfirmPage,
          hasEmailConfirmationToken,
          isPasswordRecovery,
        }
      );
      setIsEmailConfirmation(true);

      // Redirect to confirmed-email page to show success message
      // The confirmed-email page will handle logout after showing success
      navigate("/confirmed-email" + window.location.hash, { replace: true });
    } else {
      console.log("🔍 Not email confirmation - allowing normal OAuth flow:", {
        path,
        hasAccessToken: hashParams.has("access_token"),
        hasTokenHash: hasEmailConfirmationToken,
        type: hashParams.get("type"),
      });
      setIsEmailConfirmation(false);
    }
  }, [navigate]);

  // Auto-redirect to dashboard if logged in and at signin page
  useEffect(() => {
    const path = window.location.pathname;

    // Check if coming from email confirmation in real-time (use same logic as above)
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", "?")
    );
    const isEmailConfirmPage = path === "/confirmed-email";
    const hasEmailConfirmationToken = urlParams.has("token_hash");
    const isPasswordRecovery = hashParams.get("type") === "recovery";

    // Only treat as email confirmation if:
    // 1. On confirmed-email page, OR
    // 2. Has token_hash (email verification)
    // BUT NOT password recovery (which has type=recovery)
    const isCurrentlyEmailConfirmation =
      isEmailConfirmPage || (hasEmailConfirmationToken && !isPasswordRecovery);

    console.log("🔍 Auto-redirect useEffect triggered:", {
      path,
      user: !!user,
      isLoading,
      isPasswordRecovery,
      isSignupFlow,
      isEmailConfirmation,
      isCurrentlyEmailConfirmation,
      hasAccessToken: hashParams.has("access_token"),
      hasTokenHash: hasEmailConfirmationToken,
      justLoggedIn,
      condition:
        !isLoading &&
        user &&
        !isPasswordRecovery &&
        !isSignupFlow &&
        !isEmailConfirmation &&
        !isCurrentlyEmailConfirmation,
    });

    // Force redirect to reset-password if user is in password recovery session
    // Check both state and URL hash for password recovery
    const currentHashParams = new URLSearchParams(
      window.location.hash.replace("#", "?")
    );
    const hasRecoveryToken = currentHashParams.get("type") === "recovery";
    const isInPasswordRecoverySession = isPasswordRecovery || hasRecoveryToken;

    if (
      !isLoading &&
      user &&
      isInPasswordRecoverySession &&
      path !== "/reset-password"
    ) {
      console.log(
        "� FORCING REDIRECT - User in password recovery session but not on reset-password page:",
        {
          path,
          isPasswordRecovery,
          user: !!user,
          isLoading,
        }
      );
      navigate("/reset-password", { replace: true });
      return;
    } else if (!isLoading && user && path !== "/reset-password") {
      console.log("🔓 NOT forcing redirect:", {
        isPasswordRecovery,
        hasRecoveryToken,
        isInPasswordRecoverySession,
        path,
      });
    }

    // Only redirect if user just logged in (not from existing session)
    if (
      !isLoading &&
      user &&
      justLoggedIn &&
      !isPasswordRecovery &&
      !isSignupFlow &&
      !isCurrentlyEmailConfirmation
    ) {
      console.log(
        "🔍 Auto-redirect check passed for fresh login, checking path:",
        path
      );
      // Only redirect from signin page, allow access to intro (/) and confirmed-email
      if (path === "/signin") {
        console.log("Redirecting from signin to /home");
        navigate("/home", { replace: true });
        setJustLoggedIn(false); // Reset flag after redirect
      } else {
        console.log(" Staying on current path:", path);
        setJustLoggedIn(false); // Reset flag
      }
    } else {
      console.log(" Auto-redirect conditions not met - no fresh login");
    }
  }, [
    user,
    isLoading,
    isPasswordRecovery,
    isSignupFlow,
    isEmailConfirmation,
    justLoggedIn,
    navigate,
  ]);

  // Handle password recovery redirect on mount
  useEffect(() => {
    const hashParams = new URLSearchParams(
      window.location.hash.replace("#", "?")
    );
    const isPasswordRecovery = hashParams.get("type") === "recovery";
    const currentPath = window.location.pathname;

    if (isPasswordRecovery && currentPath !== "/reset-password") {
      console.log(
        "Password recovery URL detected - redirecting to reset-password page"
      );
      navigate("/reset-password" + window.location.hash, { replace: true });
    }
  }, [navigate]); // Run once on mount

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      const { session } = await AuthService.getSession();
      setSession(session);

      if (session?.user) {
        // Lấy thông tin user đầy đủ từ database
        const fullUser = await fetchUserFromDatabase(session.user);

        setUserId(fullUser?.userid || session.user.id);
        setUser(fullUser);
      } else {
        setUserId(null);
        setUser(null);
      }

      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange(async (event, session) => {
      console.log("🔥 Auth state changed:", {
        event,
        userEmail: session?.user?.email,
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
      setSession(session);

      if (event === "PASSWORD_RECOVERY") {
        // User đang trong quá trình reset password
        console.log(
          "Password recovery event detected - navigating to reset-password page"
        );
        setIsPasswordRecovery(true);
        if (session?.user) {
          const fullUser = await fetchUserFromDatabase(session.user);
          setUserId(fullUser?.userid || session.user.id);
          setUser(fullUser);
        } else {
          setUserId(null);
          setUser(null);
        }

        // Navigate to reset-password page with URL params
        navigate("/reset-password" + window.location.hash, { replace: true });
      } else if (event === "SIGNED_IN") {
        // User đã đăng nhập thành công (có thể sau khi reset password hoặc OAuth)
        console.log("🔍 SIGNED_IN event - user signed in");

        // Check if this is password recovery flow first
        const currentPath = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash.replace("#", "?")
        );
        const hasEmailConfirmationToken = urlParams.has("token_hash");
        const isPasswordRecoveryFromURL = hashParams.get("type") === "recovery";
        const isOnResetPage = currentPath === "/reset-password";

        // Check if we're currently in a password recovery session
        const isCurrentlyPasswordRecovery =
          isPasswordRecovery || isPasswordRecoveryFromURL || isOnResetPage;

        // Only reset password recovery state if NOT in password recovery flow
        if (!isCurrentlyPasswordRecovery) {
          setIsPasswordRecovery(false);
        }

        // Check if this is email confirmation vs normal login/OAuth vs password recovery
        const isConfirmationFlow =
          currentPath === "/confirmed-email" ||
          hasEmailConfirmationToken ||
          isCurrentlyPasswordRecovery;

        // Detect OAuth login: check if user has OAuth provider (google, github, etc.)
        // OAuth users typically have identities array with provider info
        const hasOAuthProvider = session?.user?.identities?.some(
          (identity) => identity.provider !== 'email'
        ) || (session?.user?.app_metadata?.provider && 
              session?.user?.app_metadata?.provider !== 'email');
        
        const isOAuthLogin = hasOAuthProvider && !isConfirmationFlow;

        if (session?.user) {
          const fullUser = await fetchUserFromDatabase(session.user);
          setUserId(fullUser?.userid || session.user.id);
          setUser(fullUser);

          // Check and update role for OAuth users (Google, etc.) on first login
          if (isOAuthLogin) {
            console.log("🔍 OAuth login detected, checking user role...");
            // Run async without blocking the flow
            checkAndUpdateOAuthUserRole(session.user).then(() => {
              // Refresh user data after role update
              fetchUserFromDatabase(session.user).then((updatedUser) => {
                if (updatedUser) {
                  setUser(updatedUser);
                }
              });
            });
          }
        } else {
          setUserId(null);
          setUser(null);
        }

        console.log(
          "🔍 SIGNED_IN - current path:",
          currentPath,
          "isSignupFlow:",
          isSignupFlow,
          "isConfirmationFlow:",
          isConfirmationFlow,
          "isPasswordRecoveryFromURL:",
          isPasswordRecoveryFromURL,
          "isCurrentlyPasswordRecovery:",
          isCurrentlyPasswordRecovery,
          "isOnResetPage:",
          isOnResetPage,
          "hasAccessToken:",
          hashParams.has("access_token"),
          "hasTokenHash:",
          hasEmailConfirmationToken,
          "isOAuthLogin:",
          isOAuthLogin,
          "provider:",
          session?.user?.app_metadata?.provider
        );

        // Set justLoggedIn flag for normal logins (not email confirmation or password recovery)
        if (!isConfirmationFlow) {
          console.log("✅ Setting justLoggedIn flag for normal/OAuth login");
          setJustLoggedIn(true);
        } else {
          console.log(
            "❌ Not setting justLoggedIn flag - this is email confirmation or password recovery"
          );
        } // Auto-redirect logic will handle navigation based on justLoggedIn flag
        console.log(
          "✅ SIGNED_IN - letting auto-redirect useEffect handle navigation"
        );
      } else if (event === "SIGNED_UP") {
        // User vừa đăng ký thành công - không redirect ngay
        console.log(
          "User signed up, staying on current page for email verification"
        );
        setIsSignupFlow(true);
        if (session?.user) {
          const fullUser = await fetchUserFromDatabase(session.user);
          setUserId(fullUser?.userid || session.user.id);
          setUser(fullUser);
        } else {
          setUserId(null);
          setUser(null);
        }
      } else if (event === "SIGNED_OUT") {
        // User đã đăng xuất
        setIsPasswordRecovery(false);
        setIsSignupFlow(false);
        setUserId(null);
        setUser(null);
      } else if (event === "INITIAL_SESSION") {
        // Initial session check - không thay đổi state nếu đang trong signup flow
        console.log(
          "Initial session check:",
          session?.user?.email || "no user"
        );
        if (!isSignupFlow) {
          if (session?.user) {
            const fullUser = await fetchUserFromDatabase(session.user);
            setUserId(fullUser?.userid || session.user.id);
            setUser(fullUser);
          } else {
            setUserId(null);
            setUser(null);
          }
        }
      } else {
        // Các event khác
        console.log(
          "🔍 Other auth event:",
          event,
          "path:",
          window.location.pathname
        );
        if (session?.user) {
          const fullUser = await fetchUserFromDatabase(session.user);
          setUserId(fullUser?.userid || session.user.id);
          setUser(fullUser);
        } else {
          setUserId(null);
          setUser(null);
        }

        // Auto-redirect logic will handle navigation based on justLoggedIn flag
        console.log(
          " Other event - letting auto-redirect useEffect handle navigation"
        );
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, [navigate, isSignupFlow, isPasswordRecovery]);

  const login = async (email, password) => {
    // Don't set isLoading here - let form manage its own loading state
    try {
      const result = await AuthService.signIn(email, password);

      if (result.success) {
        // User state will be updated by the auth state change listener
        console.log("Login successful - Full user data:", {
          email: result.data.user.email,
          id: result.data.user.id,
          metadata: result.data.user.user_metadata,
          avatarUrl: result.data.user.user_metadata?.avatar_url,
          fullUserObject: result.data.user,
        });

        // Mark as fresh login to trigger redirect
        setJustLoggedIn(true);

        return { success: true, data: result.data };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
    // No finally block - let form handle loading state
  };

  const signInWithGoogle = async () => {
    // Don't set isLoading here - let form manage its own loading state
    try {
      const result = await AuthService.signInWithProvider("google");
      console.log("Google sign-in initiated - Full user data:", {
        user: result.data?.user,
        metadata: result.data?.user?.user_metadata,
        avatar: result.data?.user?.user_metadata?.avatar_url,
        picture: result.data?.user?.user_metadata?.picture, // Google thường trả về ảnh trong trường picture
      });
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        navigate("/signin");
      }
    } catch (error) {
      console.error("Login failed:", error);
      navigate("/signin");
      throw error;
    }
    // No finally block - let form handle loading state
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const result = await AuthService.signOut();

      // Luôn coi là success vì đã clear local storage
      // Ngay cả khi API call fail, user vẫn được logout local
      if (result.success) {
        // User state will be updated by the auth state change listener
        console.log("Logout successful");
        // Force clear user state nếu listener chưa kịp update
        setUser(null);
        setJustLoggedIn(false);
        return { success: true };
      } else {
        // Nếu có error nhưng vẫn clear được local, vẫn coi là success
        console.warn("Logout API failed but local storage cleared:", result.error);
        setUser(null);
        setJustLoggedIn(false);
        return { success: true };
      }
    } catch (error) {
      console.error("Logout failed:", error);
      // Ngay cả khi có exception, vẫn clear user state
      setUser(null);
      setJustLoggedIn(false);
      // Không throw error để UI không bị stuck
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData) => {
    console.log("🔥 AuthProvider signup called:", userData.email);
    // Không set isLoading ở đây vì form tự quản lý loading state
    setIsSignupFlow(true); // Đánh dấu đang trong quá trình đăng ký
    try {
      const result = await AuthService.signUp(
        userData.email,
        userData.password,
        {
          metadata: {
            full_name: userData.fullName,
            role: 'ADMIN',
          },
        }
      );

      console.log("🔥 AuthProvider signup result:", {
        success: result.success,
        hasSession: !!result.data?.session,
        hasUser: !!result.data?.user,
        emailConfirmed: result.data?.user?.email_confirmed_at,
      });

      if (result.success) {
        console.log("Signup successful:", result.data.user?.email);

        // Check if email confirmation is required
        if (
          !result.data.session &&
          result.data.user &&
          !result.data.user.email_confirmed_at
        ) {
          console.log("Email confirmation required - user not logged in yet");
          // User cần confirm email, không set user state
          return { success: true, data: result.data, needsConfirmation: true };
        }

        // Reset signup flow sau khi SignUpForm redirect hoàn tất
        setTimeout(() => {
          console.log("Resetting signup flow state");
          setIsSignupFlow(false);
        }, 5000); // Timeout lớn hơn SignUpForm redirect để đảm bảo không bị conflict

        return { success: true, data: result.data, needsConfirmation: false };
      } else {
        setIsSignupFlow(false);
        throw result.error;
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setIsSignupFlow(false);
      throw error;
    }
    // Không có finally block để set isLoading vì form tự quản lý
  };

  const resetPassword = async (email) => {
    setIsLoading(true);
    try {
      const result = await AuthService.resetPassword(email);

      if (result.success) {
        console.log("Reset password email sent to:", email);
        return { success: true, data: result.data };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Reset password failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword) => {
    setIsLoading(true);
    try {
      const result = await AuthService.updatePassword(newPassword);

      if (result.success) {
        console.log("Password updated successfully");
        setIsPasswordRecovery(false); // Reset password recovery state
        return { success: true, data: result.data };
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error("Update password failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    userId,
    user,
    session,
    isLoading,
    isPasswordRecovery,
    isSignupFlow,
    login,
    signInWithGoogle,
    logout,
    signup,
    resetPassword,
    updatePassword,
    isAuthenticated: !!userId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
