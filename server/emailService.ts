import sgMail from '@sendgrid/mail';

// Initialize SendGrid with your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export interface WelcomeEmailData {
  email: string;
  firstName?: string;
  lastName?: string;
}

export async function sendWelcomeEmail(userData: WelcomeEmailData): Promise<boolean> {
  try {
    const { email, firstName, lastName } = userData;
    const name = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'there';

    const welcomeEmailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }
        .content {
          padding: 40px 20px;
          background: #ffffff;
        }
        .welcome-text {
          font-size: 24px;
          font-weight: 300;
          color: #1a1a1a;
          margin-bottom: 20px;
        }
        .description {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
        }
        .cta-button {
          display: inline-block;
          background: #1a1a1a;
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 500;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 30px 20px;
          text-align: center;
          color: #888;
          font-size: 14px;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          color: #1a1a1a;
          text-decoration: none;
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">MODFY</div>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Premium Men's Innerwear</p>
        </div>
        
        <div class="content">
          <h1 class="welcome-text">Welcome to MODFY, ${name}!</h1>
          
          <p class="description">
            Thank you for joining our exclusive community of men who value premium comfort and sophisticated style.
          </p>
          
          <p>At MODFY, we believe that true luxury begins with what you wear closest to your skin. Our carefully curated collection of premium innerwear combines the finest materials with modern design, ensuring you feel confident and comfortable all day long.</p>
          
          <p>What makes MODFY special:</p>
          <ul style="color: #666; margin: 20px 0;">
            <li>Premium fabrics including Egyptian Cotton, Micro Mesh, and Cashmere</li>
            <li>Thoughtfully designed for the modern gentleman</li>
            <li>Sustainable and ethically sourced materials</li>
            <li>Uncompromising attention to detail and quality</li>
          </ul>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="https://your-domain.replit.app/shop" class="cta-button">Explore Our Collection</a>
          </div>
          
          <p>We're thrilled to have you as part of the MODFY family. If you have any questions or need assistance, our customer service team is here to help.</p>
          
          <p style="margin-top: 40px;">
            Welcome aboard,<br>
            <strong>The MODFY Team</strong>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>MODFY</strong> - Redefining Men's Innerwear</p>
          
          <div class="social-links">
            <a href="#">Instagram</a> |
            <a href="#">Facebook</a> |
            <a href="#">Twitter</a>
          </div>
          
          <p style="font-size: 12px; color: #aaa; margin-top: 20px;">
            You're receiving this email because you signed up for a MODFY account.<br>
            If you didn't sign up, please ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;

    const msg = {
      to: email,
      from: {
        email: 'amarnafais@gmail.com',
        name: 'MODFY - Premium Innerwear'
      },
      subject: 'Welcome to MODFY - Your Premium Journey Begins',
      html: welcomeEmailHTML,
      text: `Welcome to MODFY, ${name}! Thank you for joining our exclusive community of men who value premium comfort and sophisticated style. Explore our collection at https://your-domain.replit.app/shop`
    };

    await sgMail.send(msg);
    console.log(`Welcome email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Test the email configuration
export async function testEmailConnection(): Promise<boolean> {
  try {
    const msg = {
      to: 'legacyamar999@gmail.com',
      from: {
        email: 'amarnafais@gmail.com',
        name: 'MODFY - Test'
      },
      subject: 'Email Service Test',
      text: 'If you receive this, the email service is working correctly.',
      html: '<p>If you receive this, the email service is working correctly.</p>'
    };
    await sgMail.send(msg);
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(orderData: {
  orderNumber: string;
  totalAmount: string;
  customerName: string;
  deliveryAddress: {
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    price: string;
    imageUrl: string;
  }>;
  customerEmail?: string;
}): Promise<boolean> {
  try {
    const orderConfirmationEmailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }
        .content {
          padding: 40px 20px;
          background: #ffffff;
        }
        .order-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .order-item {
          border-bottom: 1px solid #e9ecef;
          padding: 15px 0;
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .product-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .product-details {
          flex: 1;
        }
        .product-price {
          text-align: right;
        }
        .total {
          font-weight: bold;
          font-size: 18px;
          color: #1a1a1a;
          text-align: right;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #1a1a1a;
        }
        .address-block {
          background: #fff;
          border: 1px solid #e9ecef;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">MODFY</div>
          <p style="margin: 0; font-size: 16px; opacity: 0.9;">Premium Men's Innerwear</p>
        </div>
        
        <div class="content">
          <h1>Order Confirmation - ${orderData.orderNumber}</h1>
          
          <p>Hi ${orderData.customerName},</p>
          
          <p>A new order has been received! Details below:</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${orderData.orderNumber}</p>
            
            <h4>Items Ordered:</h4>
            ${orderData.items.map(item => `
              <div class="order-item">
                <img src="${item.imageUrl}" alt="${item.productName}" class="product-image">
                <div class="product-details">
                  <strong>${item.productName}</strong><br>
                  <span style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</span>
                </div>
                <div class="product-price">
                  <strong>LKR ${(parseFloat(item.price) * item.quantity).toFixed(2)}</strong><br>
                  <span style="color: #666; font-size: 14px;">LKR ${item.price} each</span>
                </div>
              </div>
            `).join('')}
            
            <div class="total">
              Total: LKR ${orderData.totalAmount}
            </div>
          </div>
          
          <div class="address-block">
            <h4>Delivery Address:</h4>
            <p style="margin: 5px 0;">${orderData.deliveryAddress.fullName}</p>
            <p style="margin: 5px 0;">${orderData.deliveryAddress.addressLine1}</p>
            ${orderData.deliveryAddress.addressLine2 ? `<p style="margin: 5px 0;">${orderData.deliveryAddress.addressLine2}</p>` : ''}
            <p style="margin: 5px 0;">${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.postalCode}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${orderData.deliveryAddress.phoneNumber}</p>
            ${orderData.customerEmail || (orderData.deliveryAddress as any).email ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${orderData.customerEmail ?? (orderData.deliveryAddress as any).email}</p>` : ''}
          </div>
          
          <p>Please process this order promptly.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px 20px; text-align: center; color: #888; font-size: 14px;">
          <p>© 2024 MODFY. All rights reserved.</p>
          <p>Premium Men's Innerwear - Comfort Redefined</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const msg = {
      to: "legacyamar999@gmail.com",
      from: {
        email: 'amarnafais@gmail.com',
        name: 'MODFY - Order System'
      },
      subject: `New Order Received - ${orderData.orderNumber}`,
      html: orderConfirmationEmailHTML,
      text: `New order received: ${orderData.orderNumber} for LKR ${orderData.totalAmount}. Customer: ${orderData.customerName}`
    };

    await sgMail.send(msg);
    console.log(`Order confirmation email sent for order ${orderData.orderNumber}`);
    return true;
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return false;
  }
}

export async function sendOrderStatusUpdateEmail(params: {
  to: string;
  orderNumber: string;
  newStatus: string;
  customerName?: string;
  message?: string;
  items?: Array<{
    productName: string;
    quantity: number;
    price: string;
    imageUrl?: string;
  }>;
}): Promise<boolean> {
  try {
    const { to, orderNumber, newStatus, customerName = '', message = '', items = [] } = params;

    const statusEmailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container { max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; }
        .content { padding: 30px 20px; background: #fff; }
        .status { font-weight: 700; color: #1a1a1a; }
        .note { margin-top: 15px; color: #555; }
        .order-item { display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #eee; padding: 12px 0; }
        .product-image { width: 72px; height: 72px; object-fit: cover; border-radius: 6px; border: 1px solid #e9ecef; }
        .product-details { flex: 1; }
        .product-price { text-align: right; min-width: 80px; }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header"><div class="logo">MODFY</div></div>
        <div class="content">
          <h2>Order Update - ${orderNumber}</h2>
          <p>Hi ${customerName || 'Customer'},</p>
          <p>Your order <strong>${orderNumber}</strong> has been <span class="status">${newStatus.toUpperCase()}</span>.</p>

          ${items.length > 0 ? `
            <h3 style="margin-top:20px;">Items in this order</h3>
            ${items.map(item => `
              <div class="order-item">
                <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}" alt="${item.productName}" class="product-image" />
                <div class="product-details">
                  <strong>${item.productName}</strong><br />
                  <small>Qty: ${item.quantity}</small>
                </div>
                <div class="product-price">
                  <strong>LKR ${ (parseFloat(item.price || '0') * item.quantity).toFixed(2) }</strong><br />
                  <small>LKR ${item.price} each</small>
                </div>
              </div>
            `).join('')}
          ` : ''}

          <p style="margin-top:20px;">If you have any questions, reply to this email or contact our support team.</p>
          <p style="margin-top:20px;">Best regards,<br/>The MODFY Team</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const msg = {
      to,
      from: { 
        email: 'amarnafais@gmail.com',
        name: 'MODFY - Orders'
      },
      subject: `Your Order ${orderNumber} has been ${newStatus}`,
      html: statusEmailHTML,
      text: `Your order ${orderNumber} status is now ${newStatus}. ${message}`
    };

    await sgMail.send(msg);
    console.log(`Order status update email sent to ${to} for ${orderNumber}`);
    return true;
  } catch (error) {
    console.error('Failed to send order status update email:', error);
    return false;
  }
}