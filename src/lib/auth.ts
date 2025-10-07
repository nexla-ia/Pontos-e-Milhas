import { supabase } from './supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  agency_id: string;
  agency?: {
    corporate_name: string;
    trade_name: string;
    cnpj: string;
  };
}

export const signIn = async ({ email, password }: LoginCredentials) => {
  try {
    // Autenticar com Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Buscar dados do usuário na nossa tabela
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        role,
        agency_id,
        agencies (
          corporate_name,
          trade_name,
          cnpj
        )
      `)
      .eq('auth_id', authData.user.id)
      .maybeSingle();

    if (userError) throw userError;

    // Se não encontrou o usuário na tabela users, criar um registro básico
    if (!userData) {
      throw new Error(`Usuário autenticado mas não encontrado na tabela users. Auth ID: ${authData.user.id}. Verifique se existe um registro na tabela 'users' com auth_id = '${authData.user.id}'`);
    }

    return {
      user: authData.user,
      profile: userData as AuthUser,
    };
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: userData, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      role,
      agency_id,
      agencies (
        corporate_name,
        trade_name,
        cnpj
      )
    `)
    .eq('auth_id', user.id)
    .maybeSingle();

  if (error) throw error;
  
  if (!userData) return null;

  return {
    user,
    profile: userData as AuthUser,
  };
};