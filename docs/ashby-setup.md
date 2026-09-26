# Ashby ATS — Setup

## Variable d'environnement requise
Name: ASHBY_API_KEY
Value: [your Ashby API key]
Environment: Production + Preview

## Où obtenir la clé
Ashby dashboard → Settings → Integrations → API Keys → Create Key

## Test
After adding the key to Vercel and redeploying, trigger the auto-apply cron manually via Vercel dashboard → Functions → /api/auto-apply → Run.
Check auto_apply_log in Supabase: rows with ats_platform = 'ashby' confirm it works.

## Sans clé (état actuel)
Applications to Ashby job URLs are detected but skipped with status 'skipped_no_ats_match'.
No daily limit consumed.
