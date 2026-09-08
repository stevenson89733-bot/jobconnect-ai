import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = 'stevenson89733@gmail.com';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

(async () => {
  try {
    console.log('🔧 Step 1: Running migration...');
    
    // First, execute the migration using raw SQL through a stored procedure
    // Since we can't execute raw SQL directly, we'll need to check if column exists first
    
    console.log('🔍 Step 2: Looking for user:', email);
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const user = authUsers.users.find(u => u.email === email);
    if (!user) throw new Error(`User with email ${email} not found`);
    console.log('✓ Found user ID:', user.id);

    console.log('📝 Step 3: Attempting to update profile...');
    
    // Try update - if it fails with column error, provide instructions
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ is_unlimited_posting: true })
      .eq('user_id', user.id)
      .select('user_id, email, is_unlimited_posting');

    if (updateError?.message?.includes('is_unlimited_posting')) {
      console.log('\n⚠️  Column needs to be created in Supabase first.\n');
      console.log('📌 NEXT STEPS:');
      console.log('─'.repeat(70));
      console.log('1. Go to: https://app.supabase.com/project/fqlrhybynsdlbtamitay/sql');
      console.log('2. Click "New Query" and paste this:\n');
      console.log(`ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_unlimited_posting boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_unlimited_posting 
  ON public.profiles(is_unlimited_posting) 
  WHERE is_unlimited_posting = true;

UPDATE public.profiles
SET is_unlimited_posting = true
WHERE user_id = '${user.id}';`);
      console.log('\n3. Click "Run"\n');
      console.log('─'.repeat(70));
      console.log('✅ After that, your account will have unlimited posting!\n');
      process.exit(0);
    }

    if (updateError) throw updateError;

    console.log('\n✅ SUCCESS! Unlimited posting activated:');
    console.log('   User ID:', updated?.[0]?.user_id);
    console.log('   Email:', updated?.[0]?.email);
    console.log('   is_unlimited_posting:', updated?.[0]?.is_unlimited_posting);
    console.log('\n🎉 You can now post unlimited job listings!\n');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
})();
