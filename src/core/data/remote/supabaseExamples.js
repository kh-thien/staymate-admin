// Example usage of Supabase client
import { auth, database, storage, realtime, utils } from "./supabase";

// 🔐 AUTH EXAMPLES

// 1. Sign Up
export const handleSignUp = async (email, password, userData) => {
  const result = await auth.signUp(email, password, {
    metadata: {
      full_name: userData.fullName,
      avatar_url: userData.avatarUrl,
    },
  });

  if (result.success) {
    console.log("✅ User created:", result.data.user);
  } else {
    console.error("❌ Sign up failed:", result.error.message);
  }

  return result;
};

// 2. Sign In
export const handleSignIn = async (email, password) => {
  const result = await auth.signIn(email, password);

  if (result.success) {
    console.log("✅ User logged in:", result.data.user);
  } else {
    console.error("❌ Sign in failed:", result.error.message);
  }

  return result;
};

// 3. Google Sign In
export const handleGoogleSignIn = async () => {
  const result = await auth.signInWithProvider("google");

  if (result.success) {
    console.log("✅ Google sign in initiated");
  } else {
    console.error("❌ Google sign in failed:", result.error.message);
  }

  return result;
};

// 4. Sign Out
export const handleSignOut = async () => {
  const result = await auth.signOut();

  if (result.success) {
    console.log("✅ User signed out");
  } else {
    console.error("❌ Sign out failed:", result.error.message);
  }

  return result;
};

// 📊 DATABASE EXAMPLES

// 1. Fetch users
export const getUsers = async (limit = 10) => {
  const result = await database.select("users", {
    select: "id, email, full_name, avatar_url, created_at",
    orderBy: { column: "created_at", ascending: false },
    limit,
  });

  if (result.success) {
    console.log("✅ Users fetched:", result.data);
  } else {
    console.error("❌ Fetch users failed:", result.error.message);
  }

  return result;
};

// 2. Create user profile
export const createUserProfile = async (userData) => {
  const result = await database.insert("profiles", {
    user_id: userData.userId,
    full_name: userData.fullName,
    avatar_url: userData.avatarUrl,
    bio: userData.bio,
  });

  if (result.success) {
    console.log("✅ Profile created:", result.data);
  } else {
    console.error("❌ Create profile failed:", result.error.message);
  }

  return result;
};

// 3. Update user profile
export const updateUserProfile = async (userId, updates) => {
  const result = await database.update("profiles", updates, {
    user_id: userId,
  });

  if (result.success) {
    console.log("✅ Profile updated:", result.data);
  } else {
    console.error("❌ Update profile failed:", result.error.message);
  }

  return result;
};

// 📁 STORAGE EXAMPLES

// 1. Upload avatar
export const uploadAvatar = async (userId, file) => {
  const fileName = `${userId}/avatar.${file.name.split(".").pop()}`;

  const result = await storage.upload("avatars", fileName, file, {
    upsert: true,
  });

  if (result.success) {
    const publicUrl = storage.getPublicUrl("avatars", fileName);
    console.log("✅ Avatar uploaded:", publicUrl);
    return { ...result, publicUrl };
  } else {
    console.error("❌ Upload failed:", result.error.message);
  }

  return result;
};

// 2. Upload multiple files
export const uploadFiles = async (files, folder = "documents") => {
  const uploadPromises = files.map(async (file, index) => {
    const fileName = `${folder}/${Date.now()}_${index}_${file.name}`;
    return await storage.upload("files", fileName, file);
  });

  const results = await Promise.all(uploadPromises);
  console.log("✅ Files uploaded:", results);

  return results;
};

// 🔄 REALTIME EXAMPLES

// 1. Listen to new messages
export const subscribeToMessages = (chatId, onNewMessage) => {
  const channel = realtime.subscribe(
    "messages",
    (payload) => {
      console.log("📨 New message:", payload);
      if (payload.new.chat_id === chatId) {
        onNewMessage(payload.new);
      }
    },
    {
      event: "INSERT",
      filter: `chat_id=eq.${chatId}`,
    }
  );

  return channel;
};

// 2. Listen to user status changes
export const subscribeToUserStatus = (onStatusChange) => {
  const channel = realtime.subscribe(
    "user_status",
    (payload) => {
      console.log("👤 User status changed:", payload);
      onStatusChange(payload);
    },
    {
      event: "UPDATE",
    }
  );

  return channel;
};

// 🛠️ UTILITY EXAMPLES

// 1. Check authentication status
export const checkAuthStatus = async () => {
  const isAuth = await utils.isAuthenticated();
  console.log("🔐 Is authenticated:", isAuth);

  if (isAuth) {
    const { user } = await auth.getUser();
    console.log("👤 Current user:", user);
  }

  return isAuth;
};

// 2. Handle auth state changes
export const setupAuthListener = () => {
  const {
    data: { subscription },
  } = auth.onAuthStateChange((event, session) => {
    console.log("🔄 Auth state changed:", event, session);

    switch (event) {
      case "SIGNED_IN":
        console.log("✅ User signed in:", session.user);
        break;
      case "SIGNED_OUT":
        console.log("👋 User signed out");
        break;
      case "TOKEN_REFRESHED":
        console.log("🔄 Token refreshed");
        break;
      default:
        break;
    }
  });

  return subscription;
};

// 🚨 ERROR HANDLING EXAMPLE
export const handleSupabaseError = (error) => {
  const message = utils.formatError(error);

  // Log error for debugging
  console.error("Supabase Error:", {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
  });

  // Return user-friendly message
  return message;
};

// 📱 REACT HOOK EXAMPLE
import { useState, useEffect } from "react";

export const useSupabaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    auth.getSession().then(({ session }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};
