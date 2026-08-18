import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string;
  bio?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signUpWithPassword: (email: string, password: string, fullName: string) => Promise<{ error: any; data: any }>;
  updateProfile: (updates: {
    display_name?: string;
    bio?: string;
    avatar_url?: string | null;
  }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signInWithGoogle: async () => ({ error: null }),
  signInWithPassword: async () => ({ error: null, data: null }),
  signUpWithPassword: async () => ({ error: null, data: null }),
  updateProfile: async () => ({ error: null }),
  signOut: async () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile when user changes
  const syncProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }

    try {
      // 1. Fetch latest from Supabase profiles table directly
      const { data: dbProfile, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!fetchErr && dbProfile && dbProfile.display_name) {
        const userProfile: UserProfile = {
          id: currentUser.id,
          display_name: dbProfile.display_name,
          avatar_url: dbProfile.avatar_url || '',
          bio: dbProfile.bio || ''
        };
        setProfile(userProfile);
        localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(userProfile));
        return;
      }

      // 2. Check local cached custom profile edits
      const cached = localStorage.getItem(`profile_${currentUser.id}`);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (cachedData && cachedData.display_name) {
            setProfile(cachedData);
            return;
          }
        } catch (e) {}
      }

      // 3. Fallback: create fresh profile from user metadata
      const userMeta = currentUser.user_metadata || {};
      const displayName = userMeta.full_name || userMeta.name || 'Pinterest User';
      const avatarUrl = userMeta.avatar_url || userMeta.picture || '';
      const bio = 'Building the future of messaging ✨ | Pinterest Direct 🚀';

      const newProfile: UserProfile = {
        id: currentUser.id,
        display_name: displayName,
        avatar_url: avatarUrl,
        bio
      };

      setProfile(newProfile);
      localStorage.setItem(`profile_${currentUser.id}`, JSON.stringify(newProfile));

      // Persist to Supabase profiles table
      await supabase.from('profiles').upsert({
        id: currentUser.id,
        display_name: displayName,
        avatar_url: avatarUrl,
        bio,
        is_online: true,
        last_seen: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('Profile sync notice:', err);
    }
  };

  useEffect(() => {
    // 1. Get current Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        syncProfile(session.user);
      }
      setLoading(false);
    });

    // 2. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        syncProfile(session.user);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateProfile = async (updates: {
    display_name?: string;
    bio?: string;
    avatar_url?: string | null;
  }) => {
    if (!user) return { error: 'No authenticated user found' };

    try {
      const cleanDisplayName = (updates.display_name || profile?.display_name || 'Pinterest User').trim();
      const cleanBio = (updates.bio !== undefined ? updates.bio : (profile?.bio || '')).trim();
      const cleanAvatar = updates.avatar_url !== undefined ? (updates.avatar_url || '') : (profile?.avatar_url || '');

      const updatedProfile: UserProfile = {
        id: user.id,
        display_name: cleanDisplayName,
        avatar_url: cleanAvatar,
        bio: cleanBio,
        updated_at: new Date().toISOString()
      };

      // 1. Immediately update React state & LocalStorage
      setProfile(updatedProfile);
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(updatedProfile));

      // 2. Update Supabase Database profiles table
      const { data: updatedRows, error: dbError } = await supabase
        .from('profiles')
        .update({
          display_name: cleanDisplayName,
          avatar_url: cleanAvatar,
          bio: cleanBio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();

      if (dbError || !updatedRows || updatedRows.length === 0) {
        console.warn('Direct update failed, upserting:', dbError);
        await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            display_name: cleanDisplayName,
            avatar_url: cleanAvatar,
            bio: cleanBio,
            is_online: true,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
      }

      // 3. Update Supabase Auth User Metadata
      await supabase.auth.updateUser({
        data: {
          full_name: cleanDisplayName,
          name: cleanDisplayName,
          avatar_url: cleanAvatar,
          bio: cleanBio
        }
      });

      return { error: null };
    } catch (err: any) {
      console.warn('updateProfile error:', err);
      return { error: err.message };
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    return { error };
  };

  const signInWithPassword = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (data?.user) {
      setUser(data.user);
      syncProfile(data.user);
    }
    return { data, error };
  };

  const signUpWithPassword = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          name: fullName
        }
      }
    });
    if (data?.user) {
      setUser(data.user);
      syncProfile(data.user);
    }
    return { data, error };
  };

  const signOut = async () => {
    if (user) {
      localStorage.removeItem(`profile_${user.id}`);
    }
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        updateProfile,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
