interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface PaymentCapturedData {
  buyerName: string
  buyerOrgName: string
  supplierName: string
  supplierOrgName: string
  productTitle: string
  amount: number
  orderId: string
  estimatedDelivery: string
}

interface PaymentFailedData {
  buyerName: string
  buyerOrgName: string
  productTitle: string
  amount: number
  orderId: string
  errorReason: string
}

interface TransferProcessedData {
  supplierName: string
  supplierOrgName: string
  productTitle: string
  amount: number
  transferAmount: number
  orderId: string
}

export class NotificationService {
  private baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  /**
   * Send payment confirmation email to buyer
   */
  async sendPaymentConfirmationToBuyer(email: string, data: PaymentCapturedData): Promise<EmailTemplate> {
    const template = {
      subject: `Order Confirmed - ${data.productTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #0052CC; color: white; padding: 20px; text-align: center;">
              <h1>Order Confirmed!</h1>
              <p>Your payment has been processed successfully</p>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Order Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Product:</td>
                  <td style="padding: 8px;">${data.productTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Order ID:</td>
                  <td style="padding: 8px;">${data.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Amount Paid:</td>
                  <td style="padding: 8px;">₹${data.amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Supplier:</td>
                  <td style="padding: 8px;">${data.supplierOrgName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Estimated Delivery:</td>
                  <td style="padding: 8px;">${data.estimatedDelivery}</td>
                </tr>
              </table>
            </div>
            
            <div style="padding: 20px;">
              <h3>What's Next?</h3>
              <ul>
                <li>The supplier has been notified and will contact you within 24 hours</li>
                <li>You'll receive supplier contact details via email</li>
                <li>Site survey and technical discussion will be scheduled</li>
                <li>Delivery and installation timeline will be confirmed</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.baseUrl}/buy/order/${data.orderId}" 
                   style="background: #0052CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  View Order Details
                </a>
              </div>
            </div>
            
            <div style="padding: 20px; background: #f0f8ff; border-left: 4px solid #0052CC;">
              <h4>Need Support?</h4>
              <p>If you have any questions about your order, please contact our support team:</p>
              <p>Email: support@irma.co.in | Phone: +91-1800-123-4567</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>This is an automated email from IRMA Marketplace. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Order Confirmed!

Your payment has been processed successfully for ${data.productTitle}.

Order Details:
- Product: ${data.productTitle}
- Order ID: ${data.orderId}
- Amount Paid: ₹${data.amount.toLocaleString('en-IN')}
- Supplier: ${data.supplierOrgName}
- Estimated Delivery: ${data.estimatedDelivery}

What's Next?
- The supplier has been notified and will contact you within 24 hours
- You'll receive supplier contact details via email
- Site survey and technical discussion will be scheduled
- Delivery and installation timeline will be confirmed

View your order: ${this.baseUrl}/buy/order/${data.orderId}

Need Support? Contact us at support@irma.co.in or +91-1800-123-4567
      `
    }

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Email would be sent to:', email)
    console.log('Subject:', template.subject)
    
    return template
  }

  /**
   * Send new order notification to supplier
   */
  async sendNewOrderNotificationToSupplier(email: string, data: PaymentCapturedData): Promise<EmailTemplate> {
    const template = {
      subject: `New Order Received - ${data.productTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Order Received</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #059669; color: white; padding: 20px; text-align: center;">
              <h1>New Order Received!</h1>
              <p>You have a new confirmed order from ${data.buyerOrgName}</p>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Order Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Product:</td>
                  <td style="padding: 8px;">${data.productTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Order ID:</td>
                  <td style="padding: 8px;">${data.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Order Value:</td>
                  <td style="padding: 8px;">₹${data.amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Buyer:</td>
                  <td style="padding: 8px;">${data.buyerOrgName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Contact Person:</td>
                  <td style="padding: 8px;">${data.buyerName}</td>
                </tr>
              </table>
            </div>
            
            <div style="padding: 20px;">
              <h3>Immediate Actions Required:</h3>
              <ol>
                <li><strong>Contact the buyer within 24 hours</strong></li>
                <li>Schedule a site survey or technical discussion</li>
                <li>Confirm delivery timeline and installation requirements</li>
                <li>Provide detailed project schedule</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.baseUrl}/supplier/payouts" 
                   style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  View Payout Details
                </a>
              </div>
            </div>
            
            <div style="padding: 20px; background: #ecfdf5; border-left: 4px solid #059669;">
              <h4>Payment Information</h4>
              <p>Your payment has been processed and will be transferred to your linked bank account automatically.</p>
              <p>Platform fee (2.5%) has been deducted as per our terms of service.</p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>This is an automated email from IRMA Marketplace. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Order Received!

You have a new confirmed order from ${data.buyerOrgName}.

Order Details:
- Product: ${data.productTitle}
- Order ID: ${data.orderId}
- Order Value: ₹${data.amount.toLocaleString('en-IN')}
- Buyer: ${data.buyerOrgName}
- Contact Person: ${data.buyerName}

Immediate Actions Required:
1. Contact the buyer within 24 hours
2. Schedule a site survey or technical discussion
3. Confirm delivery timeline and installation requirements
4. Provide detailed project schedule

View payout details: ${this.baseUrl}/supplier/payouts

Payment Information:
Your payment has been processed and will be transferred to your linked bank account automatically.
Platform fee (2.5%) has been deducted as per our terms of service.
      `
    }

    console.log('Email would be sent to:', email)
    console.log('Subject:', template.subject)
    
    return template
  }

  /**
   * Send payment failed notification to buyer
   */
  async sendPaymentFailedNotification(email: string, data: PaymentFailedData): Promise<EmailTemplate> {
    const template = {
      subject: `Payment Failed - ${data.productTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Failed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #DC2626; color: white; padding: 20px; text-align: center;">
              <h1>Payment Failed</h1>
              <p>We were unable to process your payment</p>
            </div>
            
            <div style="padding: 20px;">
              <h2>Order Details</h2>
              <p><strong>Product:</strong> ${data.productTitle}</p>
              <p><strong>Order ID:</strong> ${data.orderId}</p>
              <p><strong>Amount:</strong> ₹${data.amount.toLocaleString('en-IN')}</p>
              <p><strong>Reason:</strong> ${data.errorReason}</p>
            </div>
            
            <div style="padding: 20px; background: #fee2e2; border-left: 4px solid #DC2626;">
              <h3>What you can do:</h3>
              <ul>
                <li>Check your account balance and card limits</li>
                <li>Verify your card details are correct</li>
                <li>Try a different payment method</li>
                <li>Contact your bank if the issue persists</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.baseUrl}/quote/${data.orderId}" 
                 style="background: #0052CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                Try Payment Again
              </a>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Payment Failed

We were unable to process your payment for ${data.productTitle}.

Order Details:
- Product: ${data.productTitle}
- Order ID: ${data.orderId}
- Amount: ₹${data.amount.toLocaleString('en-IN')}
- Reason: ${data.errorReason}

What you can do:
- Check your account balance and card limits
- Verify your card details are correct
- Try a different payment method
- Contact your bank if the issue persists

Try payment again: ${this.baseUrl}/quote/${data.orderId}
      `
    }

    console.log('Email would be sent to:', email)
    console.log('Subject:', template.subject)
    
    return template
  }

  /**
   * Send transfer processed notification to supplier
   */
  async sendTransferProcessedNotification(email: string, data: TransferProcessedData): Promise<EmailTemplate> {
    const template = {
      subject: `Payment Received - ₹${data.transferAmount.toLocaleString('en-IN')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Received</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #059669; color: white; padding: 20px; text-align: center;">
              <h1>Payment Received!</h1>
              <p>₹${data.transferAmount.toLocaleString('en-IN')} has been transferred to your account</p>
            </div>
            
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Transfer Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Product:</td>
                  <td style="padding: 8px;">${data.productTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Order ID:</td>
                  <td style="padding: 8px;">${data.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Order Value:</td>
                  <td style="padding: 8px;">₹${data.amount.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Platform Fee (2.5%):</td>
                  <td style="padding: 8px;">₹${(data.amount - data.transferAmount).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; font-weight: bold;">Transfer Amount:</td>
                  <td style="padding: 8px; color: #059669; font-weight: bold;">₹${data.transferAmount.toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>
            
            <div style="padding: 20px;">
              <p>The amount has been automatically transferred to your linked bank account and should reflect within 1-2 business days.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${this.baseUrl}/supplier/payouts" 
                   style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                  View Payout History
                </a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Payment Received!

₹${data.transferAmount.toLocaleString('en-IN')} has been transferred to your account.

Transfer Details:
- Product: ${data.productTitle}
- Order ID: ${data.orderId}
- Order Value: ₹${data.amount.toLocaleString('en-IN')}
- Platform Fee (2.5%): ₹${(data.amount - data.transferAmount).toLocaleString('en-IN')}
- Transfer Amount: ₹${data.transferAmount.toLocaleString('en-IN')}

The amount has been automatically transferred to your linked bank account and should reflect within 1-2 business days.

View payout history: ${this.baseUrl}/supplier/payouts
      `
    }

    console.log('Email would be sent to:', email)
    console.log('Subject:', template.subject)
    
    return template
  }

  /**
   * Send SMS notification (placeholder for SMS service integration)
   */
  async sendSMS(phone: string, message: string): Promise<void> {
    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log(`SMS would be sent to ${phone}: ${message}`)
  }

  /**
   * Send push notification (placeholder for push service integration)
   */
  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    // In production, integrate with push notification service (Firebase, etc.)
    console.log(`Push notification for ${userId}: ${title} - ${body}`)
  }
}

export const notificationService = new NotificationService()