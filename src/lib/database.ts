import { supabase } from './supabase';

// Database utility functions for common operations

export interface DatabaseError {
  message: string;
  code?: string;
}

export const handleDatabaseError = (error: any): DatabaseError => {
  console.error('Database error:', error);
  
  if (error.message?.includes('duplicate key')) {
    return { message: 'Este registro já existe', code: 'DUPLICATE' };
  }
  
  if (error.message?.includes('foreign key')) {
    return { message: 'Referência inválida', code: 'FOREIGN_KEY' };
  }
  
  if (error.message?.includes('not null')) {
    return { message: 'Campo obrigatório não preenchido', code: 'NOT_NULL' };
  }
  
  return { message: error.message || 'Erro desconhecido', code: 'UNKNOWN' };
};

// Generic CRUD operations
export const createRecord = async (table: string, data: any) => {
  const { data: result, error } = await supabase
    .from(table)
    .insert([data])
    .select()
    .single();
    
  if (error) throw handleDatabaseError(error);
  return result;
};

export const updateRecord = async (table: string, id: string, data: any) => {
  const { data: result, error } = await supabase
    .from(table)
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw handleDatabaseError(error);
  return result;
};

export const deleteRecord = async (table: string, id: string) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
    
  if (error) throw handleDatabaseError(error);
};

export const getRecords = async (table: string, options: {
  select?: string;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
  filters?: Record<string, any>;
} = {}) => {
  let query = supabase.from(table);
  
  if (options.select) {
    query = query.select(options.select);
  } else {
    query = query.select('*');
  }
  
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  if (options.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }
  
  if (options.limit) {
    query = query.limit(options.limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw handleDatabaseError(error);
  return data || [];
};

// Specific business logic functions
export const getUserWithProfile = async (authId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      agencies (*),
      user_profiles (*)
    `)
    .eq('auth_id', authId)
    .single();
    
  if (error) throw handleDatabaseError(error);
  return data;
};

export const getOrdersWithDetails = async (status?: string, agencyId?: string) => {
  let query = supabase
    .from('orders')
    .select(`
      *,
      users!inner (full_name),
      agencies!inner (corporate_name),
      order_items (*)
    `);
    
  if (status) {
    query = query.eq('status', status);
  }
  
  if (agencyId) {
    query = query.eq('agency_id', agencyId);
  }
  
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) throw handleDatabaseError(error);
  return data || [];
};

export const getCompanyRates = async () => {
  const { data, error } = await supabase
    .from('company_mile_rates')
    .select(`
      *,
      companies (name, code)
    `)
    .order('updated_at', { ascending: false });
    
  if (error) throw handleDatabaseError(error);
  return data || [];
};

export const upsertSetting = async (key: string, value: string) => {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' });
    
  if (error) throw handleDatabaseError(error);
};

export const getSettings = async (keys?: string[]) => {
  let query = supabase.from('settings').select('key, value');
  
  if (keys && keys.length > 0) {
    query = query.in('key', keys);
  }
  
  const { data, error } = await query;
  
  if (error) throw handleDatabaseError(error);
  
  return (data || []).reduce((acc: Record<string, string>, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {});
};