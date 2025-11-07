'use server';
import transporter from '@/lib/utils/nodemailer';

const styles = {
  container:
    'max-width:500px;margin:20px auto;padding:20px;border:1px solid #e5e5e5;border-radius:8px;background-color:#ffffff;font-family:Arial,sans-serif;',
  heading:
    'font-size:20px;color:#0a3d3f;font-weight:normal;margin-bottom:20px;',
  paragraph: 'font-size:16px;color:#333333;line-height:1.5;margin-bottom:20px;',
  link: 'display:inline-block;margin-top:15px;padding:12px 24px;background:#0a3d3f;color:#ffffff;text-decoration:none;border-radius:50px;font-weight:normal;',
   logo: 'max-width:100%;width:500px;height:auto;margin-bottom:20px;display:block;', // ← CHANGÉ
};

export async function sendEmailAction({
  to,
  subject,
  meta,
}: {
  to: string;
  subject: string;
  meta: {
    description: string;
    link: string;
  };
}) {
  const mailOptions = {
    from: process.env.NODEMAILER_USER,
    to,
    subject: `GRINDCYCLE - ${subject}`,
    html: `
    <div style="${styles.container}">
      <img src="https://rncp-grindcycle.vercel.app/banner.png" alt="banner" style="${styles.logo}" />
      <h1 style="${styles.heading}">${subject}</h1>
      <p style="${styles.paragraph}">${meta.description}</p>
      <a href="${meta.link}" style="${styles.link}">Vérifier mon compte</a>
    </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return { success: false };
  }
}