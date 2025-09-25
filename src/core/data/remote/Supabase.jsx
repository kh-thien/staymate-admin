import { createClient } from "@supabase/supabase-js";

// Supabase configuration - Vite uses import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Kiểm tra environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase configuration missing!");
  console.error(
    "Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file"
  );
}

// Tạo Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  // Realtime configuration
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});




// // Database helper functions
// export const database = {
//   // Generic select function
//   select: async (table, options = {}) => {
//     try {
//       let query = supabaseConnection.from(table).select(options.select || "*");

//       // Apply filters
//       if (options.eq) {
//         Object.entries(options.eq).forEach(([column, value]) => {
//           query = query.eq(column, value);
//         });
//       }

//       // Apply ordering
//       if (options.orderBy) {
//         query = query.order(options.orderBy.column, {
//           ascending: options.orderBy.ascending !== false,
//         });
//       }

//       // Apply pagination
//       if (options.limit) {
//         query = query.limit(options.limit);
//       }

//       if (options.offset) {
//         query = query.range(
//           options.offset,
//           options.offset + (options.limit || 10) - 1
//         );
//       }

//       const { data, error } = await query;

//       if (error) throw error;
//       return { success: true, data, error: null };
//     } catch (error) {
//       console.error(`Select from ${table} error:`, error.message);
//       return { success: false, data: null, error };
//     }
//   },

//   // Generic insert function
//   insert: async (table, data) => {
//     try {
//       const { data: result, error } = await supabaseConnection
//         .from(table)
//         .insert(data)
//         .select();

//       if (error) throw error;
//       return { success: true, data: result, error: null };
//     } catch (error) {
//       console.error(`Insert to ${table} error:`, error.message);
//       return { success: false, data: null, error };
//     }
//   },

//   // Generic update function
//   update: async (table, data, conditions) => {
//     try {
//       let query = supabaseConnection.from(table).update(data);

//       // Apply conditions
//       Object.entries(conditions).forEach(([column, value]) => {
//         query = query.eq(column, value);
//       });

//       const { data: result, error } = await query.select();

//       if (error) throw error;
//       return { success: true, data: result, error: null };
//     } catch (error) {
//       console.error(`Update ${table} error:`, error.message);
//       return { success: false, data: null, error };
//     }
//   },

//   // Generic delete function
//   delete: async (table, conditions) => {
//     try {
//       let query = supabaseConnection.from(table).delete();

//       // Apply conditions
//       Object.entries(conditions).forEach(([column, value]) => {
//         query = query.eq(column, value);
//       });

//       const { data, error } = await query;

//       if (error) throw error;
//       return { success: true, data, error: null };
//     } catch (error) {
//       console.error(`Delete from ${table} error:`, error.message);
//       return { success: false, data: null, error };
//     }
//   },
// };

// // Storage helper functions
// export const storage = {
//   // Upload file
//   upload: async (bucket, path, file, options = {}) => {
//     try {
//       const { data, error } = await supabaseConnection.storage
//         .from(bucket)
//         .upload(path, file, {
//           cacheControl: "3600",
//           upsert: options.upsert || false,
//           ...options,
//         });

//       if (error) throw error;
//       return { success: true, data, error: null };
//     } catch (error) {
//       console.error("Upload error:", error.message);
//       return { success: false, data: null, error };
//     }
//   },

//   // Download file
//   download: async (bucket, path) => {
//     try {
//       const { data, error } = await supabaseConnection.storage
//         .from(bucket)
//         .download(path);

//       if (error) throw error;
//       return { success: true, data, error: null };
//     } catch (error) {
//       console.error("Download error:", error.message);
//       return { success: false, data: null, error };
//     }
//   },

//   // Get public URL
//   getPublicUrl: (bucket, path) => {
//     const { data } = supabaseConnection.storage.from(bucket).getPublicUrl(path);

//     return data.publicUrl;
//   },

//   // Delete file
//   remove: async (bucket, paths) => {
//     try {
//       const { data, error } = await supabaseConnection.storage
//         .from(bucket)
//         .remove(Array.isArray(paths) ? paths : [paths]);

//       if (error) throw error;
//       return { success: true, data, error: null };
//     } catch (error) {
//       console.error("Remove error:", error.message);
//       return { success: false, data: null, error };
//     }
//   },
// };

// // Realtime helper functions
// export const realtime = {
//   // Subscribe to table changes
//   subscribe: (table, callback, options = {}) => {
//     const channel = supabaseConnection
//       .channel(`${table}_changes`)
//       .on(
//         "postgres_changes",
//         {
//           event: options.event || "*", // INSERT, UPDATE, DELETE, or *
//           schema: options.schema || "public",
//           table: table,
//           filter: options.filter,
//         },
//         callback
//       )
//       .subscribe();

//     return channel;
//   },

//   // Unsubscribe from channel
//   unsubscribe: (channel) => {
//     return supabaseConnection.removeChannel(channel);
//   },
// };

// // Utility functions
// export const utils = {
//   // Check if user is authenticated
//   isAuthenticated: async () => {
//     const {
//       data: { session },
//     } = await supabaseConnection.auth.getSession();
//     return !!session;
//   },

//   // Get user role (if you have RLS policies)
//   getUserRole: async () => {
//     try {
//       const {
//         data: { user },
//       } = await supabaseConnection.auth.getUser();
//       return user?.user_metadata?.role || user?.app_metadata?.role || "user";
//     } catch (error) {
//       console.error("Get user role error:", error.message);
//       return null;
//     }
//   },

//   // Format error message
//   formatError: (error) => {
//     if (error?.message) {
//       return error.message;
//     }
//     return "An unexpected error occurred";
//   },

export default supabase;

