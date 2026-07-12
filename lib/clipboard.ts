// Tiered clipboard copy, shared by the Cover Letter's Copy button and the
// Jobs page's Share button — never a dead-end failure.
//
// Tier 1: navigator.clipboard.writeText — can throw a real, documented
// NotAllowedError ("Document is not focused"), not just in automated test
// contexts; it can also fire in normal use (focus having just moved
// elsewhere).
// Tier 2: document.execCommand('copy') via an offscreen textarea — works
// synchronously off a real user click even when the async Clipboard API
// refuses.
// Tier 3 (caller's responsibility): if this returns { ok: false }, show the
// text to the user so they can select-and-copy it manually themselves.
export async function copyToClipboard(text: string): Promise<{ ok: true } | { ok: false }> {
  try {
    await navigator.clipboard.writeText(text)
    return { ok: true }
  } catch {
    // fall through to the legacy fallback below
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  document.body.removeChild(textarea)
  return { ok }
}
