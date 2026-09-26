import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(params: {
  to: string
  firstName: string
}): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  const { to, firstName } = params

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F9FF;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FF;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#0F1623;padding:28px 32px;border-radius:12px 12px 0 0">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">JobConnect AI</p>
            <p style="margin:6px 0 0;font-size:13px;color:#2E5CF6;font-weight:500">Global AI Career Operating System</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 32px;border-radius:0 0 12px 12px">
            <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#0F1623">Bienvenue, ${firstName} 👋</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151">
              Ton compte est activé. Tu peux maintenant explorer des offres d'emploi internationales, configurer ton profil et activer la candidature automatique.
            </p>
            <a href="https://jobconnect-ai.com/candidate"
               style="display:inline-block;background:#F0663A;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;margin-bottom:28px">
              Voir les offres →
            </a>
            <p style="margin:0 0 32px;font-size:14px;line-height:1.6;color:#6B7280">
              Un conseil : complète ton profil à 100% pour débloquer le score de compatibilité sur chaque offre.
            </p>
            <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 24px">
            <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6">
              © 2026 JobConnect AI · jobconnect-ai.com · Tu reçois cet email car tu viens de créer un compte.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    const { error } = await resend.emails.send({
      from: 'JobConnect AI <hello@jobconnect-ai.com>',
      to,
      subject: 'Bienvenue sur JobConnect AI 🌍',
      html,
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

type InterviewReminderParams = {
  to: string
  candidateName: string
  jobTitle: string
  companyName: string
  interviewDate: string
  meetingLink: string
}

function interviewEmailHtml(params: InterviewReminderParams & { h1: string; bodyParagraph: string }): string {
  const { candidateName: _, jobTitle, companyName, interviewDate, meetingLink, h1, bodyParagraph } = params
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F7F9FF;font-family:Inter,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FF;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#0F1623;padding:28px 32px;border-radius:12px 12px 0 0">
            <p style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.3px">JobConnect AI</p>
            <p style="margin:6px 0 0;font-size:13px;color:#2E5CF6;font-weight:500">Global AI Career Operating System</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:40px 32px;border-radius:0 0 12px 12px">
            <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#0F1623">${h1}</h1>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151">
              Tu as un entretien prévu pour le poste de <strong>${jobTitle}</strong> chez <strong>${companyName}</strong>.
            </p>
            <!-- Info box -->
            <div style="background:#EEF2FE;border-left:4px solid #2E5CF6;padding:14px 18px;border-radius:0 8px 8px 0;margin-bottom:24px">
              <p style="margin:0;font-size:15px;font-weight:600;color:#1E3A8A">📅 ${interviewDate}</p>
            </div>
            <a href="${meetingLink}"
               style="display:inline-block;background:#F0663A;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 28px;border-radius:8px;margin-bottom:28px">
              Rejoindre l'entretien →
            </a>
            <p style="margin:0 0 32px;font-size:14px;line-height:1.6;color:#6B7280">
              ${bodyParagraph}
            </p>
            <hr style="border:none;border-top:1px solid #E5E7EB;margin:0 0 24px">
            <p style="margin:0;font-size:12px;color:#9CA3AF;line-height:1.6">
              © 2026 JobConnect AI · jobconnect-ai.com
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendInterviewReminder24h(params: InterviewReminderParams): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) return { success: false, error: 'RESEND_API_KEY not configured' }

  const html = interviewEmailHtml({
    ...params,
    h1: `Ton entretien est demain, ${params.candidateName} 👋`,
    bodyParagraph: "Prépare-toi bien — consulte la description du poste et prépare 2-3 questions pour l'employeur.",
  })

  try {
    const { error } = await resend.emails.send({
      from: 'JobConnect AI <hello@jobconnect-ai.com>',
      to: params.to,
      subject: `Rappel : entretien demain — ${params.jobTitle} chez ${params.companyName}`,
      html,
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function sendInterviewReminder2h(params: InterviewReminderParams): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) return { success: false, error: 'RESEND_API_KEY not configured' }

  const html = interviewEmailHtml({
    ...params,
    h1: `Ton entretien commence dans 2h, ${params.candidateName} ⏰`,
    bodyParagraph: "C'est le moment ! Assure-toi d'avoir une connexion stable et un environnement calme.",
  })

  try {
    const { error } = await resend.emails.send({
      from: 'JobConnect AI <hello@jobconnect-ai.com>',
      to: params.to,
      subject: `Rappel : ton entretien commence dans 2h — ${params.jobTitle}`,
      html,
    })
    if (error) return { success: false, error: error.message }
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
