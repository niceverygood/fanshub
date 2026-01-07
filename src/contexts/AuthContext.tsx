import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types/database';
import type { User as AuthUser, Session } from '@supabase/supabase-js';

interface AuthContextType {
  authUser: AuthUser | null;
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { username: string; name: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // 5초 타임아웃 - 너무 오래 걸리면 강제로 로딩 종료
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log('Auth timeout - forcing loading to false');
        setLoading(false);
      }
    }, 5000);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      setSession(session);
      setAuthUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Session fetch error:', error);
      if (isMounted) setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state changed:', event);
        setSession(session);
        setAuthUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      // 프로필 조회 (타임아웃 없이)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Profile fetch result:', { data, error });

      if (error && error.code === 'PGRST116') {
        // 프로필이 없으면 자동 생성 (Google 로그인 등 OAuth 사용자)
        console.log('Profile not found, creating new profile...');
        const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
        
        if (currentAuthUser) {
          const email = currentAuthUser.email || '';
          const name = currentAuthUser.user_metadata?.full_name || 
                       currentAuthUser.user_metadata?.name || 
                       email.split('@')[0];
          const username = email.split('@')[0] + '_' + Date.now().toString(36);
          const avatarUrl = currentAuthUser.user_metadata?.avatar_url || 
                            currentAuthUser.user_metadata?.picture || null;

          console.log('Creating profile with:', { id: userId, email, username, name, avatarUrl });

          const { data: newProfile, error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              email,
              username,
              name,
              avatar_url: avatarUrl,
              is_creator: true, // 기본적으로 크리에이터로 설정
            })
            .select()
            .single();

          console.log('Insert result:', { newProfile, insertError });

          if (insertError) {
            console.error('Error creating user profile:', insertError);
            // 프로필 생성 실패해도 기본 사용자 객체 설정
            setUser({
              id: userId,
              email,
              username,
              name,
              avatar_url: avatarUrl,
              is_creator: true,
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as any);
          } else {
            setUser(newProfile);
          }
        }
      } else if (error) {
        console.error('Error fetching profile:', error);
        // 에러가 있어도 기본 사용자 객체 설정
        const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
        if (currentAuthUser) {
          setUser({
            id: userId,
            email: currentAuthUser.email || '',
            username: currentAuthUser.email?.split('@')[0] || 'user',
            name: currentAuthUser.user_metadata?.full_name || currentAuthUser.email?.split('@')[0] || 'User',
            avatar_url: currentAuthUser.user_metadata?.avatar_url || null,
            is_creator: true,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any);
        }
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // 예외 발생해도 기본 사용자 객체 설정
      const { data: { user: currentAuthUser } } = await supabase.auth.getUser();
      if (currentAuthUser) {
        setUser({
          id: userId,
          email: currentAuthUser.email || '',
          username: currentAuthUser.email?.split('@')[0] || 'user',
          name: currentAuthUser.user_metadata?.full_name || currentAuthUser.email?.split('@')[0] || 'User',
          avatar_url: currentAuthUser.user_metadata?.avatar_url || null,
          is_creator: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as any);
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { username: string; name: string }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Create user profile
      const { error: profileError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        username: userData.username,
        name: userData.name,
      });

      if (profileError) throw profileError;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

