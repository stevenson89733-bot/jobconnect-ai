import https from 'https'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { timeout: 10000 }, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => resolve(data))
      })
      .on('error', reject)
  })
}

function normalizeJobType(value) {
  if (!value) return 'Full-time'

  const normalized = String(value).toLowerCase()

  if (normalized.includes('full-time') || normalized.includes('fulltime') || normalized.includes('full time')) {
    return 'Full-time'
  }
  if (normalized.includes('part-time') || normalized.includes('parttime') || normalized.includes('part time')) {
    return 'Part-time'
  }
  if (normalized.includes('contract')) {
    return 'Contract'
  }
  if (normalized.includes('intern')) {
    return 'Internship'
  }

  console.log(`    ⚠️  Unrecognized job_type "${value}" → defaulting to "Full-time"`)
  return 'Full-time'
}

async function testHimalayas() {
  console.log('\n========== HIMALAYAS (Quick Test) ==========')
  let imported = 0, skipped = 0, errors = 0

  try {
    console.log('📥 Fetching from: https://himalayas.app/jobs/api')
    const text = await fetchText('https://himalayas.app/jobs/api')
    const data = JSON.parse(text)
    const jobs = data.jobs || []
    console.log(`✓ Fetched ${jobs.length} jobs\n`)

    // Only test first 3
    for (let i = 0; i < Math.min(3, jobs.length); i++) {
      const j = jobs[i]

      if (!j.title || !j.companyName) {
        console.log(`  [${i}] SKIP: missing title or company`)
        skipped++
        continue
      }

      const jobType = normalizeJobType(j.employmentType)
      console.log(`  [${i}] "${j.title}"`)
      console.log(`       company: ${j.companyName}`)
      console.log(`       employment: "${j.employmentType}" → "${jobType}"`)

      const { error: insertError } = await supabase.from('jobs').insert({
        title: j.title,
        company_name: j.companyName,
        description: j.description || '',
        location: j.locationRestrictions?.[0] || 'Remote',
        work_type: 'remote',
        job_type: jobType,
        category: j.parentCategories?.[0] || 'Other',
        tags: j.categories?.slice(0, 5) || [],
        apply_url: `https://himalayas.app/jobs/${j.companySlug}-${j.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`,
        source: 'himalayas',
        salary_min: j.minSalary || null,
        salary_max: j.maxSalary || null,
        salary_label: j.salaryPeriod
          ? `${j.minSalary}-${j.maxSalary} ${j.currency}/${j.salaryPeriod}`
          : null,
        is_active: true,
        posted_by: null,
      })

      if (insertError) {
        console.log(`       ❌ ERROR: ${insertError.message}`)
        errors++
      } else {
        console.log(`       ✅ INSERTED`)
        imported++
      }
    }

    console.log(`\n📊 Result: imported=${imported}, skipped=${skipped}, errors=${errors}`)
  } catch (err) {
    console.error(`❌ Fatal Error: ${err.message}`)
  }
}

testHimalayas()
