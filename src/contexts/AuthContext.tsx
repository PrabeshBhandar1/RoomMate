import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '../types/database'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // quick connection test
    ;(async () => {
      try {
        const { error } = await supabase.from('users').select('id').limit(1)
        if (error) console.warn('Supabase connection test warning:', error)
        else console.log('✅ Supabase connected')
      } catch (err) {
        console.error('Supabase connection failed:', err)
      }
    })()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    // initial check
    checkUser()

    return () => {
      try {
        authListener.subscription.unsubscribe()
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) await fetchUserProfile(authUser.id)
    } catch (error) {
      console.error('Error checking user:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      // 1) create auth account
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) {
        console.error('Auth signup error:', error)
        throw error
      }

      if (!data.user) throw new Error('Failed to create auth user')

      const userId = data.user.id

      // 2) insert profile into users table directly
      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        email,
        name: userData.name || '',
        phone: userData.phone || '',
        role: (userData.role as 'owner' | 'tenant') || 'tenant',
      })

      if (profileError) {
        console.error('Profile insertion error:', profileError)
        throw new Error(`Failed to create profile: ${profileError.message}`)
      }

      // 3) fetch & set
      const { data: userProfile, error: fetchError } = await supabase.from('users').select('*').eq('id', userId).single()
      if (fetchError) {
        console.error('Profile fetch error:', fetchError)
        throw new Error('Failed to load user profile')
      }

      setUser(userProfile)
      console.log('✅ Signup + profile creation successful')
    } catch (err: any) {
      console.error('Signup error:', err)
      throw err
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
