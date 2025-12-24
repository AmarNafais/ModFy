# Environment Variables Fix

## Issues Fixed

1. **Missing SMTP Configuration**: Added all required SMTP environment variables to `ecosystem.config.js`
2. **Environment Variables**: Updated `.env.example` to include all required variables

## What Was Changed

### ecosystem.config.js
Added the following SMTP environment variables:
- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: SMTP server port (587 for TLS, 465 for SSL)
- `SMTP_SECURE`: Whether to use SSL/TLS
- `SMTP_USER`: SMTP authentication username
- `SMTP_PASS`: SMTP authentication password
- `ADMIN_EMAIL`: Admin email address for receiving notifications

### .env.example
Updated to include complete SMTP configuration for reference.

## Required Actions

### 1. Update Production Credentials

Edit `ecosystem.config.js` and replace the placeholder values with your actual credentials:

```javascript
SMTP_HOST: "smtp.gmail.com",           // Your SMTP host
SMTP_PORT: "587",                      // Your SMTP port
SMTP_SECURE: "false",                  // "true" for port 465, "false" for port 587
SMTP_USER: "your_email@gmail.com",     // Your actual email
SMTP_PASS: "your_app_password",        // Your actual app password
ADMIN_EMAIL: "admin@modfy.com"         // Your admin email
```

#### For Gmail:
- Use `smtp.gmail.com` as SMTP_HOST
- Use port `587` with `SMTP_SECURE: "false"` (recommended)
- Generate an App Password: https://myaccount.google.com/apppasswords
- Never use your regular Gmail password

#### For Other Providers:
- **Outlook/Office 365**: `smtp-mail.outlook.com`, port 587
- **Yahoo**: `smtp.mail.yahoo.com`, port 587
- **SendGrid**: `smtp.sendgrid.net`, port 587
- **Custom SMTP**: Use your provider's settings

### 2. Restart PM2 Application

After updating the credentials, restart your application:

```bash
pm2 restart modfy-server
# or
pm2 reload ecosystem.config.js
```

### 3. Verify Configuration

Check the logs to ensure no errors:

```bash
pm2 logs modfy-server --lines 50
```

## Security Notes

- Never commit actual credentials to version control
- Use strong, unique passwords for database and email
- Consider using environment-specific configuration files
- For production, consider using PM2 ecosystem file or system environment variables
- Keep your ecosystem.config.js file secure and out of version control if it contains real credentials

## Testing Email Service

After configuration, test the email service by:
1. Creating a new user account (triggers welcome email)
2. Placing an order (triggers order confirmation email)
3. Check PM2 logs for any email-related errors

## Troubleshooting

### Database Connection Issues
- Verify MySQL credentials match your actual database setup
- Ensure MySQL service is running
- Check that the user has proper permissions

### Email Connection Timeout
- Verify SMTP credentials are correct
- Check firewall rules allow outbound connections on SMTP port
- Ensure SMTP_HOST, SMTP_PORT, and SMTP_SECURE values match your provider
- For Gmail, ensure "Less secure app access" is enabled or use App Password
- Check if your server's IP is blocked by the SMTP provider
