import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const sqlQuery = `
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_unlimited_posting boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_unlimited_posting 
  ON public.profiles(is_unlimited_posting) 
  WHERE is_unlimited_posting = true;

UPDATE public.profiles
SET is_unlimited_posting = true
WHERE user_id = '4090936e-f89c-4da0-9ffd-b7244c221814';
`;

(async () => {
  try {
    // Try to execute via rpc if function exists
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlQuery });
    
    if (error) {
      if (error.message.includes('Could not find the function')) {
        console.log('❌ SQL RPC function not available in this project');
        console.log('\n✓ Your user ID: 4090936e-f89c-4da0-9ffd-b7244c221814');
        console.log('  Email: stevenson89733@gmail.com');
        process.exit(1);
      }
      throw error;
    }

    console.log('✅ Migration & activation completed!');
    console.log(data);
    
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
