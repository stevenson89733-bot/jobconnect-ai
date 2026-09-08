import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = 'stevenson89733@gmail.com';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

(async () => {
  try {
    console.log('🔍 Looking for user:', email);
    
    // Get all users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const user = authUsers.users.find(u => u.email === email);
    if (!user) throw new Error(`User with email ${email} not found`);

    console.log('✓ Found user ID:', user.id);

    // Update profile
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ is_unlimited_posting: true })
      .eq('user_id', user.id)
      .select('user_id, email, is_unlimited_posting');

    if (updateError?.message?.includes('is_unlimited_posting')) {
      throw new Error('Column is_unlimited_posting not found. Run migration first:\nalt table public.profiles add column if not exists is_unlimited_posting boolean not null default false;');
    }

    if (updateError) throw updateError;

    console.log('\n✅ SUCCESS! Unlimited posting activated:');
    console.log('   User ID:', updated?.[0]?.user_id);
    console.log('   Email:', updated?.[0]?.email);
    console.log('   is_unlimited_posting:', updated?.[0]?.is_unlimited_posting);

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
})();
