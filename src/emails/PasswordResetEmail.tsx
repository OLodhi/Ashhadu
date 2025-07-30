import React from 'react';
import {
  Section,
  Text,
  Link,
  Row,
  Column,
  Hr,
  Img,
} from '@react-email/components';
import BaseEmailTemplate from './base/BaseEmailTemplate';

interface PasswordResetEmailProps {
  firstName: string;
  email: string;
  resetUrl: string;
  requestTime: string;
  storeEmail?: string;
  storePhone?: string;
}

export default function PasswordResetEmail({
  firstName,
  email,
  resetUrl,
  requestTime,
  storeEmail = 'support@ashhadu.co.uk',
  storePhone = '+44 7123 456 789',
}: PasswordResetEmailProps) {
  return (
    <BaseEmailTemplate previewText={`Reset your Ashhadu Islamic Art password, ${firstName}`}>
      {/* Logo Section */}
      <Section style={logoSection}>
        <Img
          src={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://ashhadu.co.uk'}/logo.png`}
          width="180"
          height="60"
          alt="Ashhadu Islamic Art"
          style={logoStyle}
        />
      </Section>

      {/* Islamic Pattern Background Header */}
      <Section style={headerSection}>
        <div style={islamicPatternOverlay} />
        <div style={headerContent}>
          <Text style={welcomeHeading}>Password Reset Request</Text>
          <Text style={brandHeading}>Ashhadu Islamic Art</Text>
          <Text style={subtitle}>Secure password reset for your account</Text>
        </div>
      </Section>

      {/* Main Content */}
      <Section style={mainSection}>
        <Text style={greeting}>Dear {firstName},</Text>
        
        <Text style={paragraph}>
          We received a request to reset the password for your Ashhadu Islamic Art account 
          associated with <strong>{email}</strong>.
        </Text>

        <Text style={paragraph}>
          If you made this request, click the button below to securely reset your password. 
          This link will expire in <strong>1 hour</strong> for your security.
        </Text>

        {/* Reset Button - Luxury Style */}
        <Section style={buttonContainer}>
          <div style={buttonWrapper}>
            <Link href={resetUrl} style={resetButton}>
              <span style={buttonIcon}>🔒</span>
              Reset Your Password
            </Link>
          </div>
          <Text style={buttonHelpText}>
            This will take you to our secure password reset page
          </Text>
        </Section>

        {/* Alternative Link */}
        <Section style={alternativeLinkSection}>
          <Text style={alternativeLinkText}>
            If the reset button doesn't work, copy and paste this link into your browser:
          </Text>
          <Text style={alternativeLink}>{resetUrl}</Text>
        </Section>

        {/* Security Notice */}
        <Section style={securitySection}>
          <Text style={securityHeading}>🛡️ Security Notice</Text>
          <Text style={securityText}>
            If you <strong>did not request</strong> this password reset, please ignore this email. 
            Your password will remain unchanged and your account is secure.
          </Text>
          <Text style={securityText}>
            This reset link will expire in <strong>1 hour</strong> for your protection.
          </Text>
        </Section>
      </Section>

      {/* Footer Information */}
      <Hr style={divider} />
      
      <Section style={footerSection}>
        <Text style={footerHeading}>Need Help?</Text>
        <Text style={footerText}>
          If you're having trouble accessing your account, our support team is here to help. Contact us at{' '}
          <Link href={`mailto:${storeEmail}`} style={supportLink}>
            {storeEmail}
          </Link>
          {' '}or call{' '}
          <Link href={`tel:${storePhone.replace(/\s+/g, '')}`} style={supportLink}>
            {storePhone}
          </Link>
        </Text>
        
        <Text style={accountDetails}>
          <strong>Reset Request Details:</strong><br />
          Email: {email}<br />
          Request Time: {requestTime}<br />
          Request Source: Password Reset Form
        </Text>

        <Text style={islamicBlessing}>
          Barakallahu feeki (May Allah bless you)
        </Text>

        {/* Footer Navigation Links */}
        <Section style={footerNavSection}>
          <Text style={footerNavLinks}>
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://ashhadu.co.uk'}/shop`} style={footerNavLink}>
              Shop
            </Link>
            {" | "}
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://ashhadu.co.uk'}/account`} style={footerNavLink}>
              Account
            </Link>
            {" | "}
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://ashhadu.co.uk'}/contact`} style={footerNavLink}>
              Contact
            </Link>
          </Text>
        </Section>
        
        <Text style={signature}>
          With warm regards,<br />
          <strong>The Ashhadu Islamic Art Team</strong><br />
          Bringing Islamic heritage to your home
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
}

// Luxury Islamic Art Email Styles
const logoSection = {
  backgroundColor: '#ffffff',
  padding: '20px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #e5e7eb',
};

const logoStyle = {
  margin: '0 auto',
  display: 'block',
};

const headerSection = {
  position: 'relative' as const,
  backgroundColor: '#1a1a1a',
  padding: '40px 20px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
  overflow: 'hidden',
};

const islamicPatternOverlay = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Ccircle cx='15' cy='15' r='2'/%3E%3Ccircle cx='45' cy='15' r='2'/%3E%3Ccircle cx='15' cy='45' r='2'/%3E%3Ccircle cx='45' cy='45' r='2'/%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  backgroundRepeat: 'repeat',
  opacity: 0.3,
};

const headerContent = {
  position: 'relative' as const,
  zIndex: 10,
};

const welcomeHeading = {
  color: '#d4af37',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  fontFamily: "'Playfair Display', serif",
};

const brandHeading = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  fontFamily: "'Playfair Display', serif",
};

const subtitle = {
  color: '#e5e7eb',
  fontSize: '16px',
  fontWeight: '400',
  margin: '0',
  fontStyle: 'italic',
};

const mainSection = {
  padding: '32px 24px',
  backgroundColor: '#ffffff',
};

const greeting = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 20px 0',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 20px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '40px 0',
};

const buttonWrapper = {
  display: 'inline-block',
};

const resetButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#d4af37',
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '700',
  textDecoration: 'none',
  padding: '16px 32px',
  borderRadius: '8px',
  border: 'none',
  boxShadow: '0 4px 14px 0 rgba(212, 175, 55, 0.25)',
  transition: 'all 0.2s ease',
};

const buttonIcon = {
  marginRight: '8px',
  fontSize: '20px',
};

const buttonHelpText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '12px 0 0 0',
  fontStyle: 'italic',
};

const alternativeLinkSection = {
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
};

const alternativeLinkText = {
  color: '#475569',
  fontSize: '14px',
  margin: '0 0 12px 0',
};

const alternativeLink = {
  color: '#d4af37',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
  fontFamily: 'monospace',
  backgroundColor: '#ffffff',
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #e2e8f0',
  margin: '0',
};

const securitySection = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
};

const securityHeading = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const securityText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0 0 8px 0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footerSection = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '0 0 12px 12px',
  textAlign: 'center' as const,
};

const footerHeading = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 20px 0',
};

const supportLink = {
  color: '#d4af37',
  textDecoration: 'none',
  fontWeight: '600',
};

const accountDetails = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '20px 0',
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  textAlign: 'left' as const,
};

const islamicBlessing = {
  color: '#d4af37',
  fontSize: '14px',
  fontWeight: '600',
  margin: '24px 0 20px 0',
  fontStyle: 'italic',
};

const footerNavSection = {
  margin: '20px 0',
  textAlign: 'center' as const,
};

const footerNavLinks = {
  color: '#374151',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
};

const footerNavLink = {
  color: '#d4af37',
  textDecoration: 'none',
  fontWeight: '600',
};

const signature = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
};