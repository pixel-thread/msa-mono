import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Invoice } from '../types/invoice.types';
import { formatCurrency, formatDate } from '@src/shared/utils/format';
import { logger } from '@src/shared/utils';

export const generateInvoiceHtml = (invoice: Invoice) => {
  const allocationsHtml = invoice.allocations
    .map(
      (alloc, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            ${alloc.contributionPeriod?.month}/
            ${alloc.contributionPeriod?.year}
          </td>
          <td>${formatCurrency(alloc.allocatedAmount, invoice.currency)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 40px;
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            color: #1f2937;
            background: #f3f4f6;
          }

          .invoice-container {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          }

          .top-bar {
            height: 8px;
            background: linear-gradient(
              90deg,
              #1e40af,
              #2563eb
            );
          }

          .header {
            padding: 40px;
            border-bottom: 1px solid #e5e7eb;
          }

          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
          }

          .association {
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .logo {
            width: 72px;
            height: 72px;
            border-radius: 12px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .association-info h1 {
            margin: 0;
            font-size: 28px;
            color: #111827;
          }

          .association-info p {
            margin: 4px 0 0;
            color: #6b7280;
            font-size: 14px;
          }

          .invoice-title {
            text-align: right;
          }

          .invoice-title h2 {
            margin: 0;
            font-size: 34px;
            color: #1e40af;
            letter-spacing: 1px;
          }

          .invoice-meta {
            margin-top: 12px;
            font-size: 14px;
            color: #4b5563;
          }

          .section {
            padding: 32px 40px;
          }

          .section-title {
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 18px;
            color: #111827;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }

          .info-card {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 18px;
          }

          .info-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #6b7280;
            margin-bottom: 8px;
          }

          .info-value {
            font-size: 15px;
            font-weight: 600;
            color: #111827;
            word-break: break-word;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          thead {
            background: #eff6ff;
          }

          th {
            padding: 14px;
            text-align: left;
            font-size: 13px;
            color: #1e3a8a;
            border-bottom: 1px solid #dbeafe;
          }

          td {
            padding: 14px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
          }

          tbody tr:nth-child(even) {
            background: #fafafa;
          }

          .summary {
            margin-top: 24px;
            display: flex;
            justify-content: flex-end;
          }

          .summary-card {
            width: 320px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 20px;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            font-size: 14px;
          }

          .summary-row.total {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 2px solid #d1d5db;
            font-size: 18px;
            font-weight: 700;
            color: #111827;
          }

          .status {
            display: inline-flex;
            align-items: center;
            padding: 6px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .status.paid {
            background: #dcfce7;
            color: #166534;
          }

          .status.pending {
            background: #fef3c7;
            color: #92400e;
          }

          .footer {
            padding: 24px 40px;
            border-top: 1px solid #e5e7eb;
            background: #f9fafb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }

          .footer strong {
            color: #374151;
          }

          @media print {
            body {
              background: white;
              padding: 0;
            }

            .invoice-container {
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>

      <body>
        <div class="invoice-container">
          <div class="top-bar"></div>

          <div class="header">
            <div class="header-row">
              <div class="association">
                <div class="logo">
                  <!-- Replace with actual logo -->
                  <!-- Example:
                  <img src="${invoice.association?.logo}" />
                  -->
                  <span style="font-size: 12px; color: #2563eb;">
                    LOGO
                  </span>
                </div>

                <div class="association-info">
                  <h1>
                    ${invoice.association?.name ?? 'Association Name'}
                  </h1>

                  <p>
                    Official Payment Invoice
                  </p>
                </div>
              </div>

              <div class="invoice-title">
                <h2>INVOICE</h2>

                <div class="invoice-meta">
                  <div class="invoice-number">
                    <strong>Invoice #:</strong>
                    ${invoice.id}
                  </div>

                  <div style="margin-top: 6px;">
                    <strong>Date:</strong>
                    ${formatDate(invoice.paymentDate)}
                  </div>

                  <div style="margin-top: 6px;">
                    <span class="status ${String(invoice.status).toLowerCase()}">
                      ${invoice.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              Billing Information
            </div>

            <div class="info-grid">
              <div class="info-card">
                <div class="info-label">
                  Billed To
                </div>

                <div class="info-value">
                  ${invoice.user?.name ?? '-'}
                </div>

                <div style="margin-top: 6px; font-size: 14px; color: #6b7280;">
                  ${invoice.user?.email ?? '-'}
                </div>
              </div>

              <div class="info-card">
                <div class="info-label">
                  Payment Details
                </div>

                <div style="margin-top: 6px; font-size: 14px; color: #6b7280;">
                  Currency: ${invoice.currency}
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">
              Contribution Allocations
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Contribution Period</th>
                  <th>Allocated Amount</th>
                </tr>
              </thead>

              <tbody>
                ${allocationsHtml}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-card">
                <div class="summary-row">
                  <span>Subtotal</span>

                  <span>
                    ${formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                </div>

                <div class="summary-row">
                  <span>Processing Fee</span>

                  <span>
                    ${formatCurrency(0, invoice.currency)}
                  </span>
                </div>

                <div class="summary-row total">
                  <span>Total</span>

                  <span>
                    ${formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="footer">
            <div>
              Thank you for your payment.
            </div>

            <div style="margin-top: 6px;">
              This invoice was generated electronically by
              <strong>
                ${invoice.association?.name ?? 'Association'}
              </strong>.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const generateAndShareInvoicePdf = async (invoice: Invoice) => {
  try {
    const html = generateInvoiceHtml(invoice);
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  } catch (error) {
    logger.error('Error generating PDF:', { error });
    throw error;
  }
};
