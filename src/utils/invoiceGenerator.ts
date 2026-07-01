import html2pdf from 'html2pdf.js';

export const generateSubscriptionInvoice = (payment: any) => {
  const invoiceHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
        <div>
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">NEXORA ERP</h1>
          <p style="margin: 5px 0 0; color: #64748b;">Plateforme de gestion complète</p>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; font-size: 24px; color: #1e293b;">FACTURE</h2>
          <p style="margin: 5px 0 0; font-weight: bold; color: #64748b;">N° ${payment.invoiceNumber}</p>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <div>
          <h3 style="color: #64748b; font-size: 14px; text-transform: uppercase; margin-bottom: 10px;">Émetteur</h3>
          <p style="margin: 0; font-weight: bold;">Nexora Tech</p>
          <p style="margin: 5px 0;">contact@nexora.sn</p>
          <p style="margin: 5px 0;">Dakar, Sénégal</p>
        </div>
        <div style="text-align: right;">
          <h3 style="color: #64748b; font-size: 14px; text-transform: uppercase; margin-bottom: 10px;">Facturé à</h3>
          <p style="margin: 0; font-weight: bold; font-size: 16px;">${payment.tenantName}</p>
          <p style="margin: 5px 0;">Date du paiement: ${new Date(payment.date).toLocaleDateString('fr-FR')}</p>
          <p style="margin: 5px 0;">Méthode: ${payment.paymentMethod}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569;">Description</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #475569;">Mois de facturation</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #475569;">Montant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e2e8f0;">
              <strong>Abonnement Nexora ERP</strong>
            </td>
            <td style="padding: 15px 12px; text-align: right; border-bottom: 1px solid #e2e8f0;">${payment.month}</td>
            <td style="padding: 15px 12px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${payment.amount.toLocaleString('fr-FR')} F</td>
          </tr>
        </tbody>
      </table>

      <div style="display: flex; justify-content: flex-end; margin-bottom: 50px;">
        <div style="width: 300px;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span>Sous-total</span>
            <span>${payment.amount.toLocaleString('fr-FR')} F</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
            <span>TVA (0%)</span>
            <span>0 F</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 15px 0; font-weight: bold; font-size: 18px; color: #2563eb;">
            <span>TOTAL PAYÉ</span>
            <span>${payment.amount.toLocaleString('fr-FR')} F</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="margin: 0;">Merci pour votre confiance !</p>
        <p style="margin: 5px 0;">Cette facture atteste du règlement de votre abonnement.</p>
      </div>
    </div>
  `;

  const container = document.createElement('div');
  container.innerHTML = invoiceHtml;
  document.body.appendChild(container);

  const opt = {
    margin:       10,
    filename:     `Facture_${payment.invoiceNumber}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(container).save().then(() => {
    document.body.removeChild(container);
  });
};
