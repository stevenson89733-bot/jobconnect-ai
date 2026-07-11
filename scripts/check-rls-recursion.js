#!/usr/bin/env node
/**
 * Static guard against the RLS infinite-recursion bug hit earlier in this
 * project (Postgres 42P17): a policy on table X whose USING/WITH CHECK
 * clause subqueries X directly re-triggers X's own policies, looping
 * forever, and breaks every read of that table, not just the intended case.
 *
 * This does not connect to a real database — it statically scans the SQL
 * migration files for "create policy ... on <table> ... ;" blocks and flags
 * any whose body queries the SAME table directly (`from <table>` /
 * `from public.<table>`). The safe pattern (see
 * supabase/fix_employer_read_recursion.sql) delegates that lookup to a
 * SECURITY DEFINER function instead, which never appears as a raw
 * "from <table>" inside the policy body itself.
 *
 * supabase/employer_read_candidates_proposal.sql is intentionally excluded:
 * it's the original buggy proposal, kept only as a historical record of the
 * incident, and is fully superseded by fix_employer_read_recursion.sql — it
 * was never meant to be (re)applied.
 */
const fs = require('fs')
const path = require('path')

const SQL_DIR = path.join(__dirname, '..', 'supabase')
const EXCLUDE_FILES = new Set(['employer_read_candidates_proposal.sql'])

const POLICY_RE = /create\s+policy\s+"[^"]*"\s+on\s+([a-zA-Z_.]+)([\s\S]*?);/gi

function tableBaseName(raw) {
  return raw.split('.').pop().toLowerCase()
}

function findViolations(filename, sql) {
  const violations = []
  let match
  POLICY_RE.lastIndex = 0
  while ((match = POLICY_RE.exec(sql)) !== null) {
    const table = tableBaseName(match[1])
    const body = match[2]
    const selfReferenceRe = new RegExp(`from\\s+(public\\.)?${table}\\b`, 'i')
    if (selfReferenceRe.test(body)) {
      violations.push({ file: filename, table })
    }
  }
  return violations
}

function main() {
  if (!fs.existsSync(SQL_DIR)) {
    console.log('No supabase/ directory found — nothing to check.')
    return
  }

  const files = fs.readdirSync(SQL_DIR).filter(f => f.endsWith('.sql') && !EXCLUDE_FILES.has(f))
  const allViolations = []

  for (const file of files) {
    const sql = fs.readFileSync(path.join(SQL_DIR, file), 'utf8')
    allViolations.push(...findViolations(file, sql))
  }

  if (allViolations.length > 0) {
    console.error('RLS recursion risk detected — a policy subqueries the same table it protects:\n')
    for (const v of allViolations) {
      console.error(`  ${v.file}: policy on "${v.table}" queries "${v.table}" directly in its USING/WITH CHECK clause.`)
    }
    console.error('\nFix: move the self-referencing lookup into a SECURITY DEFINER function and call that')
    console.error('function from the policy instead (see supabase/fix_employer_read_recursion.sql for the pattern).')
    process.exit(1)
  }

  console.log(`Checked ${files.length} SQL file(s) — no self-referencing RLS policies found.`)
}

main()
