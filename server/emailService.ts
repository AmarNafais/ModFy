import nodemailer from 'nodemailer';

// Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amarnafais@gmail.com',
    pass: 'hubf xmjv zdpi ufin'
  }
});

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

    const mailOptions = {
      from: {
        name: 'MODFY - Premium Innerwear',
        address: 'amarnafais@gmail.com'
      },
      to: email,
      subject: 'Welcome to MODFY - Your Premium Journey Begins',
      html: welcomeEmailHTML,
      text: `Welcome to MODFY, ${name}! Thank you for joining our exclusive community of men who value premium comfort and sophisticated style. Explore our collection at https://your-domain.replit.app/shop`
    };

    await transporter.sendMail(mailOptions);
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
    await transporter.verify();
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
          
          <p>Hi there,</p>
          
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

    const mailOptions = {
      from: {
        name: 'MODFY - Order System',
        address: 'amarnafais@gmail.com'
      },
      to: "legacyamar999@gmail.com",
      subject: `New Order Received - ${orderData.orderNumber}`,
      html: orderConfirmationEmailHTML,
      text: `New order received: ${orderData.orderNumber} for LKR ${orderData.totalAmount}. Customer: ${orderData.customerName}`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent for order ${orderData.orderNumber}`);
    return true;
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return false;
  }
}