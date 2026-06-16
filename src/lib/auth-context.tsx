"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db, mockDb, Profile, isSupabaseConfigured, supabase } from "./db";

interface AuthContextType {
  user: Profile | null;
  role: "administrator" | "employee" | "client" | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithDNI: (dni: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  isAdmin: boolean;
  isEmployee: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [role, setRole] = useState<"administrator" | "employee" | "client" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on load
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          db.profiles.getByEmail(session.user.email!).then((profile) => {
            if (profile) {
              db.userRoles.getByUser(profile.id).then((userRole) => {
                const roleStr = userRole ? userRole.role : "client";
                setUser(profile);
                setRole(roleStr);
                localStorage.setItem("pacheca_session_user", JSON.stringify(profile));
                localStorage.setItem("pacheca_session_role", roleStr);
              });
            }
          });
        }
        setIsLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
          const profile = await db.profiles.getByEmail(session.user.email!);
          if (profile) {
            const userRole = await db.userRoles.getByUser(profile.id);
            const roleStr = userRole ? userRole.role : "client";
            setUser(profile);
            setRole(roleStr);
            localStorage.setItem("pacheca_session_user", JSON.stringify(profile));
            localStorage.setItem("pacheca_session_role", roleStr);
          }
        } else {
          setUser(null);
          setRole(null);
          localStorage.removeItem("pacheca_session_user");
          localStorage.removeItem("pacheca_session_role");
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      const savedUser = localStorage.getItem("pacheca_session_user");
      const savedRole = localStorage.getItem("pacheca_session_role");

      if (savedUser && savedRole) {
        setUser(JSON.parse(savedUser));
        setRole(savedRole as any);
      }
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      const emailLower = email.trim().toLowerCase();

      if (isSupabaseConfigured && supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: emailLower,
          password: password || "",
        });

        if (authError) {
          return { success: false, error: authError.message };
        }

        const profile = await db.profiles.getByEmail(emailLower);
        if (!profile) {
          return { success: false, error: "Usuario autenticado pero sin perfil en la base de datos." };
        }

        const userRole = await db.userRoles.getByUser(profile.id);
        const roleStr = userRole ? userRole.role : "client";

        setUser(profile);
        setRole(roleStr);
        localStorage.setItem("pacheca_session_user", JSON.stringify(profile));
        localStorage.setItem("pacheca_session_role", roleStr);

        return { success: true };
      }

      // Search profile in database
      const profile = await db.profiles.getByEmail(emailLower);
      if (!profile) {
        return { success: false, error: "Usuario no encontrado. Si te registraste con DNI, usá la opción correspondiente." };
      }

      // Optional password check (demo mode: any password or no password works)
      if (password && profile.password && profile.password !== password) {
        return { success: false, error: "Contraseña incorrecta." };
      }

      // Find user role
      const userRole = await db.userRoles.getByUser(profile.id);
      const roleStr = userRole ? userRole.role : "client";

      setUser(profile);
      setRole(roleStr);

      localStorage.setItem("pacheca_session_user", JSON.stringify(profile));
      localStorage.setItem("pacheca_session_role", roleStr);

      // Audit Log
      await db.audit.log({
        user_email: emailLower,
        action_type: "LOGIN",
        entity_name: "profiles",
        entity_id: profile.id,
        reason: `Login exitoso con rol ${roleStr} (Modo Demo)`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al iniciar sesión." };
    }
  };

  // Login by DNI - for customers registered manually by staff
  const loginWithDNI = async (dni: string, email: string, password?: string) => {
    try {
      const emailLower = email.trim().toLowerCase();
      const dniClean = dni.trim();

      if (isSupabaseConfigured && supabase) {
        // 1. Find customer by DNI
        const customer = await db.customers.getByDni(dniClean);
        if (!customer) {
          return { success: false, error: "No se encontró ningún cliente con ese DNI. Verificá que tu DNI haya sido registrado por la tienda." };
        }

        // 2. Check if there's already a profile linked
        let profile = customer.profile_id ? await db.profiles.get(customer.profile_id) : null;

        if (!profile) {
          // Try to find by email
          profile = await db.profiles.getByEmail(emailLower);
        }

        if (!profile) {
          if (!password) {
            return { success: false, error: "Para vincular tu cuenta, debés crear una contraseña." };
          }

          // Register user in Supabase Auth
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: emailLower,
            password: password,
          });

          if (signUpError) {
            return { success: false, error: signUpError.message };
          }

          const authUser = signUpData.user;
          if (!authUser) {
            return { success: false, error: "Error al registrar usuario en Supabase Auth." };
          }

          // Create the profile in our profiles table (with the UUID from Auth)
          const newProfile: Profile = {
            id: authUser.id,
            email: emailLower,
            first_name: customer.first_name,
            last_name: customer.last_name,
            avatar_url: null,
            whatsapp: customer.whatsapp || customer.phone || "",
            created_at: new Date().toISOString(),
          };

          const { error: profileError } = await supabase.from("profiles").insert(newProfile);
          if (profileError) {
            console.error("Error creating profile row:", profileError);
          }

          // Set user role
          await db.userRoles.setRole(authUser.id, "client");

          // Link customer to the new profile
          customer.profile_id = authUser.id;
          await db.customers.update(customer.id, { profile_id: authUser.id });

          profile = newProfile;
        } else {
          return { success: false, error: "Esta cuenta ya está vinculada. Por favor, iniciá sesión usando tu Email y Contraseña." };
        }

        const roleStr = "client";
        setUser(profile);
        setRole(roleStr);
        localStorage.setItem("pacheca_session_user", JSON.stringify(profile));
        localStorage.setItem("pacheca_session_role", roleStr);

        return { success: true };
      }

      // 1. Find customer by DNI
      const customer = mockDb.customers.find(c => c.dni === dniClean);
      if (!customer) {
        return { success: false, error: "No se encontró ningún cliente con ese DNI. Verificá que tu DNI haya sido registrado por la tienda." };
      }

      // 2. Check if there's already a profile linked
      let profile = customer.profile_id ? mockDb.profiles.find(p => p.id === customer.profile_id) : null;

      if (!profile) {
        // Try to find by email
        profile = mockDb.profiles.find(p => p.email === emailLower) || null;
      }

      if (!profile) {
        if (!password) {
          return { success: false, error: "Para vincular tu cuenta, debés definir una contraseña." };
        }
        // Create a new profile and link it to the customer
        const newProfile: Profile = {
          id: `p_${Date.now()}`,
          email: emailLower,
          first_name: customer.first_name,
          last_name: customer.last_name,
          avatar_url: null,
          whatsapp: customer.whatsapp || customer.phone || "",
          password: password,
          created_at: new Date().toISOString(),
        };
        mockDb.profiles.push(newProfile);
        mockDb.user_roles.push({ id: `ur_${Date.now()}`, user_id: newProfile.id, role: "client" });
        // Link customer to new profile
        customer.profile_id = newProfile.id;
        profile = newProfile;
      } else if (!customer.profile_id) {
        // Link existing profile to customer
        customer.profile_id = profile.id;
      }

      const roleStr = "client";
      setUser(profile);
      setRole(roleStr);
      localStorage.setItem("pacheca_session_user", JSON.stringify(profile));
      localStorage.setItem("pacheca_session_role", roleStr);

      await db.audit.log({
        user_email: emailLower,
        action_type: "LOGIN_DNI",
        entity_name: "customers",
        entity_id: customer.id,
        reason: `Cliente ${customer.first_name} ${customer.last_name} vinculó cuenta con DNI`,
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Error al vincular cuenta." };
    }
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut().catch(console.error);
    }
    if (user) {
      db.audit.log({
        user_email: user.email,
        action_type: "LOGOUT",
        entity_name: "profiles",
        entity_id: user.id,
        reason: "Cierre de sesión manual",
      });
    }
    setUser(null);
    setRole(null);
    localStorage.removeItem("pacheca_session_user");
    localStorage.removeItem("pacheca_session_role");
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;
    const updated = await db.profiles.update(user.id, data);
    if (updated) {
      setUser(updated);
      localStorage.setItem("pacheca_session_user", JSON.stringify(updated));
    }
  };

  const isAdmin = role === "administrator";
  const isEmployee = role === "employee" || role === "administrator";
  const isClient = role === "client";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        login,
        loginWithDNI,
        logout,
        updateProfile,
        isAdmin,
        isEmployee,
        isClient,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
