export const isSupabaseConfigured = false;

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: async () => ({ data: [], error: null }),
    insert: async () => ({ error: null }),
    update: async () => ({ error: null }),
    delete: async () => ({ error: null }),
    eq: () => ({ select: async () => ({ data: [], error: null }), update: async () => ({ error: null }), delete: async () => ({ error: null }) }),
  }),
};
