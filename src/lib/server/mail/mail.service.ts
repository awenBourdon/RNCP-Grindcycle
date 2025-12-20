const styles = {
  container:
    'max-width:600px;margin:20px auto;padding:20px;border:1px solid #e5e5e5;border-radius:8px;background-color:#ffffff;font-family:Arial,sans-serif;',
  heading:
    'font-size:24px;color:#0a3d3f;font-weight:bold;margin-bottom:20px;text-align:center;',
  paragraph: 'font-size:16px;color:#333333;line-height:1.6;margin-bottom:20px;',
  link: 'display:inline-block;margin-top:20px;padding:12px 24px;background:#0a3d3f;color:#ffffff;text-decoration:none;border-radius:50px;font-weight:bold;text-align:center;',
  logo: 'max-width:100%;width:200px;height:auto;margin:0 auto 20px;display:block;',
  productContainer: 'border-bottom:1px solid #eeeeee;padding:15px 0;display:flex;align-items:center;',
  productImage: 'width:60px;height:60px;object-fit:cover;border-radius:4px;margin-right:15px;',
  productInfo: 'flex:1;',
  productName: 'font-size:16px;font-weight:bold;color:#333333;margin:0 0 5px;',
  productPrice: 'font-size:14px;color:#666666;margin:0;',
  totalContainer: 'margin-top:20px;text-align:right;',
  totalText: 'font-size:18px;font-weight:bold;color:#0a3d3f;',
};

import transporter from '@/lib/utils/nodemailer';
import { OrderWithRelations } from '../orders/repository/interface-orders.repository';
import { PaymentType } from '@/generated/prisma';

export class MailService {
  constructor() {}

  async sendOrderConfirmationEmail(toEmail: string, order: OrderWithRelations, invoiceUrl: string | null): Promise<void> {
    try {
      if (!toEmail) {
        console.error('Email manquant pour la confirmation de commande');
        return;
      }

      const isPointsPayment = order.paymentType === PaymentType.POINTS;

      // Génération de la liste des produits
      let productsHtml = '';
      if (order.orderItems && order.orderItems.length > 0) {
        productsHtml = order.orderItems.map(item => {
          // Fallback image if product has no images
          const imageUrl = item.product?.imageUrl?.[0] || 'https://rncp-grindcycle.vercel.app/placeholder-board.png'; 
          const priceDisplay = isPointsPayment 
            ? `${item.pricePoints} pts` 
            : `${item.priceEuro.toFixed(2)} €`;

          return `
            <div style="border-bottom:1px solid #eeeeee;padding:15px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="70" valign="top">
                     <img src="${imageUrl}" alt="${item.productName}" style="width:60px;height:60px;object-fit:cover;border-radius:4px;" />
                  </td>
                  <td valign="middle">
                     <p style="${styles.productName}">${item.productName}</p>
                     <p style="${styles.productPrice}">${priceDisplay}</p>
                  </td>
                </tr>
              </table>
            </div>
          `;
        }).join('');
      }

      const userName = order.user?.name;
      
      const subject = isPointsPayment 
        ? `Confirmation de ton échange #${order.id.slice(0, 8)}`
        : `Confirmation de ta commande #${order.id.slice(0, 8)}`;

      const introText = isPointsPayment
        ? `Merci de sauver la planête !`
        : `Merci pour ta commande !`;
      
      const bodyTextReceived = isPointsPayment
        ? `Ton échange a été enregistré avec succès et nos équipes vont s'en occuper très vite..`
        : `Ta commande a bien été reçue et nos équipes vont s'en occuper très vite.`;

      const totalAmountDisplay = isPointsPayment
        ? `${order.pointsUsed} pts`
        : `${order.totalAmount.toFixed(2)} €`;

      const mailOptions = {
        from: `"GrindCycle" <${process.env.NODEMAILER_USER}>`,
        to: toEmail,
        subject: subject,
        text: `Salut ${userName} !\n\n${introText}\n\n${bodyTextReceived}\n\n${invoiceUrl ? `Tu peux télécharger ta facture ici : ${invoiceUrl}` : ''}\n\nA très vite,\nL'équipe GrindCycle`,
        html: `
          <div style="${styles.container}">
            <img src="https://rncp-grindcycle.vercel.app/banner.png" alt="GrindCycle" style="${styles.logo}" />
            
            <h1 style="${styles.heading}">${isPointsPayment ? 'Echange confirmé !' : 'Merci pour ta commande !'}</h1>
            
            <p style="${styles.paragraph}">Salut <strong>${userName}</strong>,</p>
            
            <p style="${styles.paragraph}">
              ${isPointsPayment 
                ? `Ton échange <strong>#${order.id.slice(0, 8)}</strong> nous est bien parvenue. Tes points ont été débités. On revient vers toi dès qu'on s'en occupe ! ` 
                : `Ta commande <strong>#${order.id.slice(0, 8)}</strong> nous est bien parvenue. On revient vers toi dès qu'on s'en occupe !`
              }
            </p>

            <h3 style="color:#0a3d3f;margin-bottom:10px;">Récapitulatif</h3>
            ${productsHtml}

            <div style="${styles.totalContainer}">
               <p style="${styles.totalText}">Total: ${totalAmountDisplay}</p>
            </div>

            ${invoiceUrl ? `
              <div style="text-align:center;margin-top:30px;">
                <a href="${invoiceUrl}" style="${styles.link}">Télécharger ma facture</a>
              </div>
            ` : ''}
            
            <p style="${styles.paragraph}" style="margin-top:30px;text-align:center;font-size:14px;color:#888;">
              Si tu as la moindre question, n'hésite pas à nous contacter sur hellogrindcycle@gmail.com.
            </p>
            
            <p style="text-align:center;font-weight:bold;color:#0a3d3f;">L'équipe GrindCycle</p>
          </div>
        `,
      };

      console.log(`Envoi de l'email de confirmation à ${toEmail}...`);
      await transporter.sendMail(mailOptions);
      console.log('Email envoyé avec succès.');

    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de confirmation:", error);
    }
  }

  async sendBoardSubmissionConfirmationEmail(toEmail: string, boardName: string, boardDescription: string | null, boardImages: string[], userName: string): Promise<void> {
    try {
      if (!toEmail) return;

      const mainImage = boardImages && boardImages.length > 0 ? boardImages[0] : 'https://rncp-grindcycle.vercel.app/placeholder-board.png';

      const mailOptions = {
        from: `"GrindCycle" <${process.env.NODEMAILER_USER}>`,
        to: toEmail,
        subject: `Réception de ta planche "${boardName}"`,
        text: `Salut ${userName} !\n\nNous avons bien reçu ta demande de reprise pour la planche "${boardName}".\n\nNos experts vont analyser les photos et la description.\nSi tout est ok, tu recevras bientôt un bordereau d'envoi pour nous l'expédier.\n\nA très vite,\nL'équipe GrindCycle`,
        html: `
          <div style="${styles.container}">
            <img src="https://rncp-grindcycle.vercel.app/banner.png" alt="GrindCycle" style="${styles.logo}" />
            
            <h1 style="${styles.heading}">Demande bien reçue !</h1>
            
            <p style="${styles.paragraph}">Salut <strong>${userName}</strong>,</p>
            
            <p style="${styles.paragraph}">
              Nous avons bien enregistré ta demande de reprise pour ta planche <strong>"${boardName}"</strong>.
            </p>
            
            <div style="background-color:#f9f9f9;padding:15px;border-radius:8px;margin:20px 0;">
              <img src="${mainImage}" alt="${boardName}" style="width:100%;max-width:300px;height:auto;border-radius:4px;display:block;margin:0 auto 15px;" />
              <p style="text-align:center;font-weight:bold;margin:0;">${boardName}</p>
              ${boardDescription ? `<p style="text-align:center;font-size:14px;color:#666;margin:5px 0 0;">${boardDescription}</p>` : ''}
            </div>

            <p style="${styles.paragraph}">
              <strong>Prochaine étape :</strong><br/>
              Nos experts vont analyser minutieusement tes photos et ta description.
            </p>
            
            <p style="${styles.paragraph}">
              Si ta planche correspond à nos critères de reprise, tu recevras un nouvel email avec un <strong>bordereau d'envoi prépayé</strong> pour nous l'expédier gratuitement.
            </p>

            <p style="${styles.paragraph}" style="margin-top:30px;text-align:center;font-size:14px;color:#888;">
              Merci de donner une seconde vie à ta planche !
            </p>
            
            <p style="text-align:center;font-weight:bold;color:#0a3d3f;">L'équipe GrindCycle</p>
          </div>
        `,
      };

      console.log(`Envoi email soumission planche à ${toEmail}`);
      await transporter.sendMail(mailOptions);
      
    } catch (error) {
      console.error('Erreur envoi email soumission planche:', error);
    }
  }
}
