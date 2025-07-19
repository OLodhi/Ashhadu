import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Link,
  Hr,
  Row,
  Column,
} from '@react-email/components';

interface BaseEmailTemplateProps {
  children: React.ReactNode;
  previewText?: string;
}

export default function BaseEmailTemplate({ 
  children, 
  previewText = "Ashhadu Islamic Art" 
}: BaseEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Img
                  src="https://ashhadu.co.uk/logo.png"
                  width="180"
                  height="60"
                  alt="Ashhadu Islamic Art"
                  style={logo}
                />
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={hr} />
            <Row>
              <Column style={footerColumn}>
                <Text style={footerText}>
                  <strong>Ashhadu Islamic Art</strong><br />
                  Premium Islamic Calligraphy & Art<br />
                  London, United Kingdom
                </Text>
              </Column>
              <Column style={footerColumn}>
                <Text style={footerText}>
                  <Link href="https://ashhadu.co.uk/shop" style={footerLink}>
                    Shop
                  </Link>
                  {" | "}
                  <Link href="https://ashhadu.co.uk/account" style={footerLink}>
                    Account
                  </Link>
                  {" | "}
                  <Link href="https://ashhadu.co.uk/contact" style={footerLink}>
                    Contact
                  </Link>
                </Text>
              </Column>
            </Row>
            
            <Row style={{ marginTop: "20px" }}>
              <Column>
                <Text style={unsubscribeText}>
                  You received this email because you have an account with Ashhadu Islamic Art.
                  {" "}
                  <Link href="{{unsubscribeUrl}}" style={unsubscribeLink}>
                    Unsubscribe
                  </Link>
                  {" | "}
                  <Link href="https://ashhadu.co.uk/privacy" style={unsubscribeLink}>
                    Privacy Policy
                  </Link>
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px 8px 0 0',
  padding: '20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderTop: 'none',
  borderRadius: '0 0 8px 8px',
  padding: '32px',
};

const footer = {
  marginTop: '32px',
};

const footerColumn = {
  width: '50%',
  verticalAlign: 'top' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const footerLink = {
  color: '#d4af37',
  textDecoration: 'none',
};

const unsubscribeText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
  textAlign: 'center' as const,
};

const unsubscribeLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};