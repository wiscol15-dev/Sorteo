import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Sorteos Premium <noreply@tusdominio.com>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Error de Resend:", error);
      return { success: false };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Fallo crítico en envío de email:", error);
    return { success: false };
  }
};
