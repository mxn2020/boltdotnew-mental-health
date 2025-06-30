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

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        encryption.initializeKey(session.access_token);
        loadUserProfile(session.user.id);
      } else {
        // Check for anonymous session
        const anonymousId = localStorage.getItem('mh_anonymous_id');
        if (anonymousId) {
          setIsAnonymous(true);
          encryption.initializeKey();
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        encryption.initializeKey(session.access_token);
        await loadUserProfile(session.user.id);
        setIsAnonymous(false);
      } else {
        setProfile(null);
        encryption.clearKey();
        
        // Check for anonymous session
        const anonymousId = localStorage.getItem('mh_anonymous_id');
        if (anonymousId) {
          setIsAnonymous(true);
          encryption.initializeKey();
        } else {
          setIsAnonymous(false);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
    await supabase.auth.signOut();
    localStorage.removeItem('mh_anonymous_id');
    localStorage.removeItem('mh_device_key');
    encryption.clearKey();
    setIsAnonymous(false);
  };

  const createAnonymousSession = async () => {
    const anonymousId = encryption.generateAnonymousId();
    localStorage.setItem('mh_anonymous_id', anonymousId);
    encryption.initializeKey();
    setIsAnonymous(true);
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

      // Delete auth user
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

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