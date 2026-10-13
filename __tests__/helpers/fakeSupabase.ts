// Minimal chainable stand-in for a supabase-js client. Every query resolves
// through a single `handler(call)` so each test decides what the "database"
// returns for a given table/operation/filter set, and can assert on writes.

export type Call = {
  table: string
  op: 'select' | 'insert' | 'update'
  payload?: unknown
  filters: Array<[string, string, unknown]>
  single: boolean
}
export type Result = { data?: unknown; error?: { code?: string; message: string } | null; count?: number | null }
export type Handler = (call: Call) => Result

export function fakeSupabase(handler: Handler) {
  const calls: Call[] = []
  const from = (table: string) => {
    const call: Call = { table, op: 'select', filters: [], single: false }
    const run = () => {
      calls.push(call)
      const r = handler(call)
      return Promise.resolve({ data: r.data ?? null, error: r.error ?? null, count: r.count ?? null })
    }
    const b: Record<string, unknown> = {
      // .select() after insert/update is a RETURNING clause — op stays as is.
      select: () => b,
      insert: (p: unknown) => { call.op = 'insert'; call.payload = p; return b },
      update: (p: unknown) => { call.op = 'update'; call.payload = p; return b },
      eq: (c: string, v: unknown) => { call.filters.push([c, 'eq', v]); return b },
      is: (c: string, v: unknown) => { call.filters.push([c, 'is', v]); return b },
      not: (c: string, o: string, v: unknown) => { call.filters.push([c, `not.${o}`, v]); return b },
      gte: (c: string, v: unknown) => { call.filters.push([c, 'gte', v]); return b },
      order: () => b,
      limit: () => b,
      maybeSingle: () => { call.single = true; return run() },
      single: () => { call.single = true; return run() },
      then: (res: (v: unknown) => unknown, rej?: (e: unknown) => unknown) => run().then(res, rej),
    }
    return b
  }
  return { client: { from } as never, calls }
}

export const filter = (call: Call, col: string) => call.filters.find(([c]) => c === col)?.[2]
