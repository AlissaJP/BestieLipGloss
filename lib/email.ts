import nodemailer from 'nodemailer';

function createTransport() {
  const user = process.env.BREVO_LOGIN_EMAIL;
  const pass = process.env.BREVO_API_KEY;
  if (!user || !pass) throw new Error('BREVO_LOGIN_EMAIL ou BREVO_API_KEY manquant dans .env.local');
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });
}

export async function sendOtpEmail(to: string, code: string, name?: string): Promise<void> {
  const displayName = name ? name.split(' ')[0] : 'là';
  const transport = createTransport();

  await transport.sendMail({
    from: `"Bestie LipGloss" <${process.env.BREVO_SENDER_EMAIL}>`,
    to,
    subject: `${code} — votre code de vérification Bestie LipGloss`,
    html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F2E9E1;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F2E9E1;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

          <tr>
            <td align="center" style="padding-bottom:24px;">
              <p style="margin:0;font-size:32px;font-family:Georgia,serif;color:#e07b9a;letter-spacing:0.02em;">
                Bestie LipGloss
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#ffffff;border-radius:24px;border:1px solid #fce7f3;padding:40px 36px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#1f2937;">
                Bonjour ${displayName} 👋
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6;">
                Voici votre code de vérification pour créer votre compte Bestie LipGloss.
                Ce code est valable pendant <strong>2&nbsp;minutes</strong>.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:#fdf2f8;border:2px solid #f9a8d4;border-radius:16px;padding:18px 40px;">
                      <span style="font-size:36px;font-weight:700;letter-spacing:0.3em;color:#e07b9a;font-family:Georgia,serif;">
                        ${code}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#9ca3af;line-height:1.6;">
                Ne partagez jamais ce code. Bestie LipGloss ne vous le demandera jamais par téléphone ou par message.
              </p>
              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
                Si vous n'avez pas demandé ce code, ignorez cet e-mail.
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding-top:20px;">
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                &copy; ${new Date().getFullYear()} Bestie LipGloss — Tous droits réservés
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });
}
