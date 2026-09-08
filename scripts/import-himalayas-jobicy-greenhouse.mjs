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

function extractTag(xml, tag) {
  const regex = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)</' + tag + '>')
  return xml.match(regex)?.[1] || ''
}

function cleanHTML(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function normalizeJobType(value) {
  if (!value) return 'Full-time'

  const normalized = String(value).toLowerCase()

  // Map various inputs to allowed enum values
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

  // Default to Full-time if unrecognized
  console.log(`    ⚠️  Unrecognized job_type "${value}" → defaulting to "Full-time"`)
  return 'Full-time'
}

async function importHimalayas() {
  console.log('\n========== HIMALAYAS ==========')
  let imported = 0, deduplicated = 0, skipped = 0, errors = 0

  try {
    console.log('📥 Fetching from: https://himalayas.app/jobs/api')
    const text = await fetchText('https://himalayas.app/jobs/api')
    const data = JSON.parse(text)
    const jobs = data.jobs || []
    console.log(`✓ Fetched ${jobs.length} jobs from Himalayas API`)

    for (let i = 0; i < jobs.length; i++) {
      const j = jobs[i]

      // Check required fields
      if (!j.title) {
        console.log(`  [${i}] SKIP: missing title`)
        skipped++
        continue
      }
      if (!j.companyName) {
        console.log(`  [${i}] SKIP: missing companyName`)
        skipped++
        continue
      }

      const applyUrl = `https://himalayas.app/jobs/${j.companySlug}-${j.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`

      // Check if already in DB by URL
      const { data: byUrl, error: urlError } = await supabase
        .from('jobs')
        .select('id')
        .eq('apply_url', applyUrl)
        .limit(1)

      if (urlError) {
        console.log(`  [${i}] ERROR checking URL: ${urlError.message}`)
        errors++
        continue
      }

      if (byUrl?.[0]) {
        console.log(`  [${i}] DEDUP: URL match (${applyUrl.substring(0, 50)}...)`)
        deduplicated++
        continue
      }

      // Check if already in DB by title+company
      const { data: byTitle, error: titleError } = await supabase
        .from('jobs')
        .select('id')
        .ilike('title', j.title.trim())
        .ilike('company_name', j.companyName.trim())
        .limit(1)

      if (titleError) {
        console.log(`  [${i}] ERROR checking title: ${titleError.message}`)
        errors++
        continue
      }

      if (byTitle?.[0]) {
        console.log(`  [${i}] DEDUP: Title+Company match (${j.title})`)
        deduplicated++
        continue
      }

      // Insert
      const location = j.locationRestrictions?.[0] || 'Remote'
      const jobType = normalizeJobType(j.employmentType)
      console.log(`    [${i}] job_type: "${j.employmentType}" → "${jobType}"`)
      const { error: insertError } = await supabase.from('jobs').insert({
        title: j.title,
        company_name: j.companyName,
        description: j.description || '',
        location,
        work_type: 'remote',
        job_type: jobType,
        category: j.parentCategories?.[0] || 'Other',
        tags: j.categories?.slice(0, 5) || [],
        apply_url: applyUrl,
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
        console.log(`  [${i}] INSERT ERROR: ${insertError.message} (${j.title})`)
        errors++
      } else {
        console.log(`  [${i}] ✓ INSERTED: ${j.title}`)
        imported++
      }
    }

    console.log(
      `\n📊 Himalayas Summary: imported=${imported}, deduplicated=${deduplicated}, skipped=${skipped}, errors=${errors}`
    )
    return { source: 'himalayas', imported, deduplicated, skipped, errors }
  } catch (err) {
    console.error(`❌ Himalayas Fatal Error: ${err.message}`)
    return { source: 'himalayas', imported: 0, deduplicated: 0, skipped: 0, errors: 1 }
  }
}

async function importJobicy() {
  console.log('\n========== JOBICY ==========')
  let imported = 0, deduplicated = 0, skipped = 0, errors = 0

  try {
    console.log('📥 Fetching from: https://jobicy.com/?feed=job_feed')
    const xml = await fetchText('https://jobicy.com/?feed=job_feed')
    console.log(`✓ Fetched XML (${xml.length} bytes)`)

    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    let itemCount = 0

    while ((match = itemRegex.exec(xml)) !== null) {
      itemCount++
      const item = match[1]
      const title = extractTag(item, 'title')
      const link = extractTag(item, 'link')
      const description = extractTag(item, 'description')
      const company = extractTag(item, 'company') || 'Unknown'

      // Check required fields
      if (!title) {
        console.log(`  [${itemCount}] SKIP: missing title`)
        skipped++
        continue
      }
      if (!link) {
        console.log(`  [${itemCount}] SKIP: missing link`)
        skipped++
        continue
      }

      // Check if already in DB by URL
      const { data: byUrl, error: urlError } = await supabase
        .from('jobs')
        .select('id')
        .eq('apply_url', link)
        .limit(1)

      if (urlError) {
        console.log(`  [${itemCount}] ERROR checking URL: ${urlError.message}`)
        errors++
        continue
      }

      if (byUrl?.[0]) {
        console.log(`  [${itemCount}] DEDUP: URL match (${link.substring(0, 50)}...)`)
        deduplicated++
        continue
      }

      // Check if already in DB by title+company
      const { data: byTitle, error: titleError } = await supabase
        .from('jobs')
        .select('id')
        .ilike('title', title.trim())
        .ilike('company_name', company.trim())
        .limit(1)

      if (titleError) {
        console.log(`  [${itemCount}] ERROR checking title: ${titleError.message}`)
        errors++
        continue
      }

      if (byTitle?.[0]) {
        console.log(`  [${itemCount}] DEDUP: Title+Company match (${title})`)
        deduplicated++
        continue
      }

      // Insert
      const { error: insertError } = await supabase.from('jobs').insert({
        title: cleanHTML(title),
        company_name: cleanHTML(company),
        description: cleanHTML(description),
        location: 'Remote',
        work_type: 'remote',
        job_type: 'Full-time',
        category: 'Other',
        tags: [],
        apply_url: link,
        source: 'jobicy',
        salary_min: null,
        salary_max: null,
        salary_label: null,
        is_active: true,
        posted_by: null,
      })

      if (insertError) {
        console.log(`  [${itemCount}] INSERT ERROR: ${insertError.message} (${title})`)
        errors++
      } else {
        console.log(`  [${itemCount}] ✓ INSERTED: ${title}`)
        imported++
      }
    }

    console.log(`✓ Parsed ${itemCount} items from feed`)
    console.log(
      `\n📊 Jobicy Summary: imported=${imported}, deduplicated=${deduplicated}, skipped=${skipped}, errors=${errors}`
    )
    return { source: 'jobicy', imported, deduplicated, skipped, errors }
  } catch (err) {
    console.error(`❌ Jobicy Fatal Error: ${err.message}`)
    return { source: 'jobicy', imported: 0, deduplicated: 0, skipped: 0, errors: 1 }
  }
}

async function importGreenhouse() {
  console.log('\n========== GREENHOUSE ==========')
  const companies = ['gitlab', 'automattic', 'zapier', 'buffer', 'doist', 'basecamp', 'hotjar', 'toggl', 'remote', 'deel']
  let imported = 0, deduplicated = 0, skipped = 0, errors = 0

  try {
    for (const company of companies) {
      console.log(`\n  → ${company}`)
      try {
        const url = `https://boards-api.greenhouse.io/v1/boards/${company}/jobs?content=true`
        console.log(`    📥 Fetching: ${url}`)
        const text = await fetchText(url)
        const data = JSON.parse(text)
        const jobs = data.jobs || []
        console.log(`    ✓ Fetched ${jobs.length} jobs`)

        for (let i = 0; i < jobs.length; i++) {
          const j = jobs[i]

          // Check required fields
          if (!j.absolute_url) {
            console.log(`    [${i}] SKIP: missing absolute_url`)
            skipped++
            continue
          }
          if (!j.title) {
            console.log(`    [${i}] SKIP: missing title`)
            skipped++
            continue
          }

          // Check if already in DB by URL
          const { data: byUrl, error: urlError } = await supabase
            .from('jobs')
            .select('id')
            .eq('apply_url', j.absolute_url)
            .limit(1)

          if (urlError) {
            console.log(`    [${i}] ERROR checking URL: ${urlError.message}`)
            errors++
            continue
          }

          if (byUrl?.[0]) {
            console.log(`    [${i}] DEDUP: URL match`)
            deduplicated++
            continue
          }

          // Check if already in DB by title+company
          const { data: byTitle, error: titleError } = await supabase
            .from('jobs')
            .select('id')
            .ilike('title', j.title.trim())
            .ilike('company_name', company.trim())
            .limit(1)

          if (titleError) {
            console.log(`    [${i}] ERROR checking title: ${titleError.message}`)
            errors++
            continue
          }

          if (byTitle?.[0]) {
            console.log(`    [${i}] DEDUP: Title+Company match`)
            deduplicated++
            continue
          }

          // Insert
          const { error: insertError } = await supabase.from('jobs').insert({
            title: j.title,
            company_name: company,
            description: j.content || '',
            location: j.location?.name || 'Remote',
            work_type: 'remote',
            job_type: 'Full-time',
            category: 'Other',
            tags: [],
            apply_url: j.absolute_url,
            source: 'greenhouse',
            salary_min: null,
            salary_max: null,
            salary_label: null,
            is_active: true,
            posted_by: null,
          })

          if (insertError) {
            console.log(`    [${i}] INSERT ERROR: ${insertError.message}`)
            errors++
          } else {
            console.log(`    [${i}] ✓ INSERTED`)
            imported++
          }
        }
      } catch (e) {
        console.log(`  ⚠️  ${company} failed: ${e.message}`)
        errors++
      }
    }

    console.log(
      `\n📊 Greenhouse Summary: imported=${imported}, deduplicated=${deduplicated}, skipped=${skipped}, errors=${errors}`
    )
    return { source: 'greenhouse', imported, deduplicated, skipped, errors }
  } catch (err) {
    console.error(`❌ Greenhouse Fatal Error: ${err.message}`)
    return { source: 'greenhouse', imported: 0, deduplicated: 0, skipped: 0, errors: 1 }
  }
}

;(async () => {
  console.log('🚀 Starting import process...\n')

  const results = []
  results.push(await importHimalayas())
  results.push(await importJobicy())
  results.push(await importGreenhouse())

  console.log('\n\n========== FINAL SUMMARY ==========')
  let totalImported = 0, totalDedup = 0, totalSkipped = 0, totalErrors = 0
  for (const r of results) {
    console.log(`${r.source}: imported=${r.imported}, dedup=${r.deduplicated}, skipped=${r.skipped}, errors=${r.errors}`)
    totalImported += r.imported
    totalDedup += r.deduplicated
    totalSkipped += r.skipped
    totalErrors += r.errors
  }
  console.log(`\nTOTAL: imported=${totalImported}, dedup=${totalDedup}, skipped=${totalSkipped}, errors=${totalErrors}`)
})()
