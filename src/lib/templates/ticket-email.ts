/**
 * PLANTILLA PROFESIONAL DE TICKET DE COMPRA
 * Diseñada para máxima legibilidad y estética de alto impacto. [cite: 2026-02-13]
 */

interface TicketEmailProps {
  userName: string;
  raffleTitle: string;
  numbers: number[];
  total: number;
}

export const getTicketEmailTemplate = ({
  userName,
  raffleTitle,
  numbers,
  total,
}: TicketEmailProps): string => {
  // Ordenamos los números para una presentación profesional
  const sortedNumbers = [...numbers].sort((a, b) => a - b);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmación de Compra - Sorteos Premium</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 30px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                    
                    <tr>
                        <td align="center" style="background-color: #0f172a; padding: 50px 40px;">
                            <div style="background-color: #2563eb; width: 60px; height: 60px; border-radius: 15px; margin-bottom: 20px; display: inline-block;">
                                <img src="https://cdn-icons-png.flaticon.com/512/833/833314.png" width="40" style="padding-top: 10px;" alt="Ticket Icon">
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; font-style: italic;">
                                ¡Confirmación de Compra!
                            </h1>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 50px 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 18px; color: #1e293b; font-weight: 700;">
                                Hola, ${userName.split(" ")[0]} 👋
                            </p>
                            <p style="margin: 0 0 30px 0; font-size: 16px; color: #64748b; line-height: 1.6;">
                                Tu participación ha sido registrada exitosamente en nuestro sistema. Aquí tienes los detalles oficiales de tu ticket digital:
                            </p>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding: 30px;">
                                        <p style="margin: 0; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">
                                            Sorteo Activo
                                        </p>
                                        <h2 style="margin: 5px 0 25px 0; font-size: 22px; font-weight: 900; color: #0f172a; text-transform: uppercase;">
                                            ${raffleTitle}
                                        </h2>

                                        <p style="margin: 0 0 10px 0; font-size: 10px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">
                                            Tus Números Seleccionados
                                        </p>
                                        <div style="display: block;">
                                            ${sortedNumbers
                                              .map(
                                                (n) => `
                                                <div style="display: inline-block; background-color: #0f172a; color: #ffffff; width: 45px; height: 45px; line-height: 45px; text-align: center; border-radius: 12px; margin: 0 5px 5px 0; font-size: 16px; font-weight: 900;">
                                                    ${n.toString().padStart(2, "0")}
                                                </div>
                                            `,
                                              )
                                              .join("")}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px; border-top: 2px dashed #e2e8f0; padding-top: 20px;">
                                <tr>
                                    <td style="font-size: 16px; color: #64748b; font-weight: 600;">Total de la Inversión:</td>
                                    <td align="right" style="font-size: 24px; color: #0f172a; font-weight: 900;">
                                        $${total.toFixed(2)}
                                    </td>
                                </tr>
                            </table>

                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 40px;">
                                <tr>
                                    <td align="center">
                                        <a href="${process.env.NEXT_PUBLIC_SITE_URL}/mis-tickets" style="background-color: #2563eb; color: #ffffff; padding: 20px 40px; border-radius: 15px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);">
                                            Ver mis boletos en vivo
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                Este es un comprobante automático. No es necesario responder.<br>
                                © 2026 Sorteos Premium. Todos los derechos reservados. [cite: 2026-02-13]
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};
