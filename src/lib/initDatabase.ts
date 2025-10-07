import { supabase } from './supabase';

export async function initDatabase() {
  try {
    // Check if tables exist by trying to query them
    const { error: checkError } = await supabase
      .from('flight_searches')
      .select('id')
      .limit(1);

    // If tables don't exist (404), we can't create them from client
    // This needs to be done via Supabase dashboard or CLI
    if (checkError) {
      console.warn('Database tables may not exist yet. Please run migrations:', checkError.message);
      return false;
    }

    console.log('Database tables verified successfully');
    return true;
  } catch (error) {
    console.error('Error checking database:', error);
    return false;
  }
}
