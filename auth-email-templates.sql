-- ================================================================================
-- AUTH EMAIL TEMPLATES FOR RESEND INTEGRATION
-- ================================================================================
-- Add Account Activation and Password Reset email templates to existing email_templates table

-- Account Activation Email Template
INSERT INTO email_templates (
    template_key,
    name,
    description,
    subject_template,
    html_content,
    text_content,
    variables,
    category,
    active
) VALUES (
    'account_activation',
    'Account Activation',
    'Email sent to new users to activate their account',
    'Activate Your Ashhadu Islamic Art Account',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activate Your Account</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: #1a1a1a; padding: 20px; text-align: center; }
        .logo { color: #d4af37; font-size: 24px; font-weight: bold; }
        .content { padding: 32px; }
        .heading { font-size: 28px; font-weight: bold; color: #1a1a1a; margin: 0 0 24px 0; font-family: Georgia, serif; }
        .paragraph { font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 16px 0; }
        .button-container { text-align: center; margin: 32px 0; }
        .button { background: #d4af37; color: #1a1a1a; padding: 16px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
        .info-box { background: #fefce8; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .footer { background: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        .signature { margin: 32px 0 0 0; font-size: 16px; color: #1a1a1a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Ashhadu Islamic Art</div>
        </div>
        <div class="content">
            <h1 class="heading">Welcome to Ashhadu Islamic Art, {{firstName}}!</h1>
            
            <p class="paragraph">Thank you for joining our community of Islamic art enthusiasts. We''re excited to have you discover our collection of authentic Islamic calligraphy, architectural models, and decorative pieces.</p>

            <p class="paragraph">To complete your registration and activate your account, please click the button below:</p>

            <div class="button-container">
                <a href="{{activationUrl}}" class="button">Activate Your Account</a>
            </div>

            <p class="paragraph">Or copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: #6b7280; word-break: break-all; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">{{activationUrl}}</p>

            <div class="info-box">
                <strong>What''s next?</strong><br>
                Once your account is activated, you''ll be able to:
                <br>• Browse our exclusive Islamic art collections
                <br>• Save items to your wishlist
                <br>• Place orders for authentic 3D printed Islamic art
                <br>• Request custom Arabic calligraphy commissions
                <br>• Receive updates on new arrivals and special offers
            </div>

            <p class="paragraph">
                <strong>Account Details:</strong><br>
                Email: {{email}}<br>
                Registration Date: {{registrationDate}}
            </p>

            <p class="paragraph">If you didn''t create this account, please ignore this email or contact our support team.</p>

            <div class="signature">
                Blessings and peace,<br>
                <strong>The Ashhadu Islamic Art Team</strong><br>
                <em>Premium Islamic Calligraphy & Art</em>
            </div>
        </div>
        <div class="footer">
            <p>Ashhadu Islamic Art • London, United Kingdom</p>
            <p>You received this email because you created an account with us.</p>
        </div>
    </div>
</body>
</html>',
    'Welcome to Ashhadu Islamic Art, {{firstName}}!

Thank you for joining our community of Islamic art enthusiasts.

To complete your registration and activate your account, please click this link:
{{activationUrl}}

Account Details:
Email: {{email}}
Registration Date: {{registrationDate}}

What''s next?
Once your account is activated, you''ll be able to:
• Browse our exclusive Islamic art collections
• Save items to your wishlist  
• Place orders for authentic 3D printed Islamic art
• Request custom Arabic calligraphy commissions
• Receive updates on new arrivals and special offers

If you didn''t create this account, please ignore this email.

Blessings and peace,
The Ashhadu Islamic Art Team
Premium Islamic Calligraphy & Art

---
Ashhadu Islamic Art • London, United Kingdom',
    '{"firstName": "User''s first name", "email": "User''s email address", "activationUrl": "Account activation URL", "registrationDate": "Date account was created"}',
    'auth',
    true
);

-- Password Reset Email Template
INSERT INTO email_templates (
    template_key,
    name,
    description,
    subject_template,
    html_content,
    text_content,
    variables,
    category,
    active
) VALUES (
    'password_reset',
    'Password Reset',
    'Email sent to users who request a password reset',
    'Reset Your Ashhadu Islamic Art Password',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: #1a1a1a; padding: 20px; text-align: center; }
        .logo { color: #d4af37; font-size: 24px; font-weight: bold; }
        .content { padding: 32px; }
        .heading { font-size: 28px; font-weight: bold; color: #1a1a1a; margin: 0 0 24px 0; font-family: Georgia, serif; }
        .paragraph { font-size: 16px; line-height: 1.6; color: #374151; margin: 0 0 16px 0; }
        .button-container { text-align: center; margin: 32px 0; }
        .button { background: #d4af37; color: #1a1a1a; padding: 16px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
        .security-box { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 14px; }
        .warning-box { background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 20px; margin: 24px 0; color: #7c2d12; }
        .help-section { background: #f9fafb; border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 15px; }
        .footer { background: #f9fafb; padding: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
        .signature { margin: 32px 0 0 0; font-size: 16px; color: #1a1a1a; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Ashhadu Islamic Art</div>
        </div>
        <div class="content">
            <h1 class="heading">Password Reset Request</h1>
            
            <p class="paragraph">Hello {{greeting}},</p>

            <p class="paragraph">We received a request to reset the password for your Ashhadu Islamic Art account associated with <strong>{{email}}</strong>.</p>

            <p class="paragraph">If you made this request, click the button below to set a new password:</p>

            <div class="button-container">
                <a href="{{resetUrl}}" class="button">Reset Your Password</a>
            </div>

            <p class="paragraph">Or copy and paste this link into your browser:</p>
            <p style="font-size: 14px; color: #6b7280; word-break: break-all; background: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">{{resetUrl}}</p>

            <div class="security-box">
                <strong>🔒 Security Information</strong><br>
                This password reset link will expire in 60 minutes for your security.<br>
                {{#if ipAddress}}Request made from IP: {{ipAddress}}<br>{{/if}}
                {{#if userAgent}}Device: {{userAgent}}<br>{{/if}}
                Time: {{requestTime}}
            </div>

            <div class="warning-box">
                <strong>⚠️ Important Security Notice</strong><br>
                If you did not request this password reset, please ignore this email. Your password will remain unchanged. 
                <br><br>
                If you''re concerned about the security of your account, please contact our support team immediately at support@ashhadu.co.uk.
            </div>

            <div class="help-section">
                <strong>Contact Support:</strong><br>
                📧 Email: support@ashhadu.co.uk<br>
                🕐 Hours: Monday-Friday, 9 AM - 6 PM GMT<br>
                📱 We typically respond within 24 hours
            </div>

            <div class="signature">
                Stay secure,<br>
                <strong>The Ashhadu Islamic Art Team</strong><br>
                <em>Premium Islamic Calligraphy & Art</em>
            </div>
        </div>
        <div class="footer">
            <p>Ashhadu Islamic Art • London, United Kingdom</p>
            <p>You received this email because a password reset was requested for your account.</p>
        </div>
    </div>
</body>
</html>',
    'Password Reset Request

Hello {{greeting}},

We received a request to reset the password for your Ashhadu Islamic Art account associated with {{email}}.

If you made this request, click this link to set a new password:
{{resetUrl}}

This password reset link will expire in 60 minutes for your security.

If you did not request this password reset, please ignore this email. Your password will remain unchanged.

Need Help?
Email: support@ashhadu.co.uk
Hours: Monday-Friday, 9 AM - 6 PM GMT

Stay secure,
The Ashhadu Islamic Art Team
Premium Islamic Calligraphy & Art

---
Ashhadu Islamic Art • London, United Kingdom',
    '{"greeting": "Greeting (firstName or Dear Customer)", "email": "User''s email address", "resetUrl": "Password reset URL", "ipAddress": "Request IP address (optional)", "userAgent": "User agent (optional)", "requestTime": "Time of request"}',
    'auth',
    true
);

-- Verify the templates were inserted successfully
SELECT template_key, name, category, active FROM email_templates WHERE template_key IN ('account_activation', 'password_reset');