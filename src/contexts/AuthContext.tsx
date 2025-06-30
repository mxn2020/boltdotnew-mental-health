// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { encryption } from '../lib/encryption';

export type PrivacyLevel = 'anonymous' | 'email' | 'enhanced';

export interface UserProfile {
  id: string;
  user_id: string;
  privacy_level: PrivacyLevel;
  display_name: string | null;
  emergency_contact: string | null;
  data_retention_days: number;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAnonymous: boolean;
  signUp: (email: string, password: string, privacyLevel?: PrivacyLevel) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  createAnonymousSession: () => Promise<void>;
  upgradeToEmail: (email: string, password: string) => Promise<{ error: any }>;
  updatePrivacyLevel: (level: PrivacyLevel) => Promise<{ error: any }>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Helper function to clear all auth state
  const clearAuthState = () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsAnonymous(false);
    encryption.clearKey();
  };

  // Helper function to check for anonymous session
  const checkAnonymousSession = () => {
    const anonymousId = localStorage.getItem('mh_anonymous_id');
    if (anonymousId) {
      setIsAnonymous(true);
      encryption.initializeKey();
      return true;
    }
    return false;
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('Error getting session:', error);
          // If there's an error getting session, check for anonymous mode
          if (!checkAnonymousSession()) {
            clearAuthState();
          }
          setLoading(false);
          return;
        }

        if (session?.user) {
          setSession(session);
          setUser(session.user);
          encryption.initializeKey(session.access_token);
          await loadUserProfile(session.user.id);
          setIsAnonymous(false);
        } else {
          // No authenticated session, check for anonymous
          if (!checkAnonymousSession()) {
            clearAuthState();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (!checkAnonymousSession()) {
          clearAuthState();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state change:', event, session?.user?.id);

      // Handle sign out event explicitly
      if (event === 'SIGNED_OUT') {
        clearAuthState();
        // Don't check for anonymous session on explicit sign out
        setLoading(false);
        return;
      }

      if (session?.user) {
        setSession(session);
        setUser(session.user);
        encryption.initializeKey(session.access_token);
        await loadUserProfile(session.user.id);
        setIsAnonymous(false);
      } else {
        // No session - check if we should be in anonymous mode
        setSession(null);
        setUser(null);
        setProfile(null);
        
        // Only check for anonymous session if we're not explicitly signing out
        if (event !== 'SIGNED_OUT' && !checkAnonymousSession()) {
          setIsAnonymous(false);
          encryption.clearKey();
        }
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const createUserProfile = async (userId: string, privacyLevel: PrivacyLevel = 'email') => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          privacy_level: privacyLevel,
          data_retention_days: 730, // 2 years default
        })
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { error: null };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, privacyLevel: PrivacyLevel = 'email') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      if (data.user) {
        await createUserProfile(data.user.id, privacyLevel);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Clear any existing anonymous session before signing in
      localStorage.removeItem('mh_anonymous_id');
      localStorage.removeItem('mh_device_key');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear local storage first
      localStorage.removeItem('mh_anonymous_id');
      localStorage.removeItem('mh_device_key');
      
      // Clear encryption keys
      encryption.clearKey();
      
      // Clear local state immediately
      clearAuthState();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        // Even if Supabase signout fails, we've cleared local state
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAnonymousSession = async () => {
    // Clear any existing auth session first
    await supabase.auth.signOut();
    
    const anonymousId = encryption.generateAnonymousId();
    localStorage.setItem('mh_anonymous_id', anonymousId);
    encryption.initializeKey();
    setIsAnonymous(true);
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const upgradeToEmail = async (email: string, password: string) => {
    try {
      if (!isAnonymous) {
        throw new Error('Not in anonymous mode');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await createUserProfile(data.user.id, 'email');
        // TODO: Migrate anonymous data to authenticated account
        localStorage.removeItem('mh_anonymous_id');
        localStorage.removeItem('mh_device_key');
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updatePrivacyLevel = async (level: PrivacyLevel) => {
    try {
      if (!user || !profile) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ privacy_level: level })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Delete profile first
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      // Delete auth user (this would need admin privileges)
      // Note: In production, this should be handled by a server-side function
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      // Clear local state
      clearAuthState();
      localStorage.removeItem('mh_anonymous_id');
      localStorage.removeItem('mh_device_key');

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAnonymous,
    signUp,
    signIn,
    signOut,
    createAnonymousSession,
    upgradeToEmail,
    updatePrivacyLevel,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}