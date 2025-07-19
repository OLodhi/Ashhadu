import React from 'react';
import {
  Section,
  Text,
  Link,
  Row,
  Column,
  Img,
} from '@react-email/components';
import BaseEmailTemplate from './base/BaseEmailTemplate';

interface WelcomeEmailProps {
  customerName: string;
  customerEmail: string;
}

export default function WelcomeEmail({
  customerName,
  customerEmail,
}: WelcomeEmailProps) {
  return (
    <BaseEmailTemplate previewText="Welcome to Ashhadu Islamic Art">
      {/* Header Message */}
      <Section>
        <Text style={heading}>Welcome to Ashhadu Islamic Art</Text>
        <Text style={subheading}>
          As-salāmu ʿalaykum, {customerName}!
        </Text>
        <Text style={paragraph}>
          We're delighted to welcome you to our community of Islamic art enthusiasts. 
          Ashhadu Islamic Art specializes in creating premium 3D printed Islamic calligraphy 
          and architectural pieces that bring the beauty of Islamic heritage into your home.
        </Text>
      </Section>

      {/* Featured Collections */}
      <Section>
        <Text style={sectionHeading}>Discover Our Collections</Text>
        
        <Row style={collectionRow}>
          <Column style={collectionColumn}>
            <Img
              src="https://ashhadu.co.uk/images/collections/calligraphy.jpg"
              width="120"
              height="120"
              alt="Islamic Calligraphy"
              style={collectionImage}
            />
            <Text style={collectionTitle}>Islamic Calligraphy</Text>
            <Text style={collectionDescription}>
              Beautiful Arabic calligraphy pieces including Ayat al-Kursi, Bismillah, and custom text
            </Text>
          </Column>
          <Column style={collectionColumn}>
            <Img
              src="https://ashhadu.co.uk/images/collections/architecture.jpg"
              width="120"
              height="120"
              alt="Mosque Architecture"
              style={collectionImage}
            />
            <Text style={collectionTitle}>Mosque Architecture</Text>
            <Text style={collectionDescription}>
              Detailed scale models of famous mosques and Islamic architectural heritage
            </Text>
          </Column>
        </Row>
        
        <Row style={collectionRow}>
          <Column style={collectionColumn}>
            <Img
              src="https://ashhadu.co.uk/images/collections/geometric.jpg"
              width="120"
              height="120"
              alt="Geometric Art"
              style={collectionImage}
            />
            <Text style={collectionTitle}>Geometric Art</Text>
            <Text style={collectionDescription}>
              Traditional Islamic geometric patterns in modern 3D printed form
            </Text>
          </Column>
          <Column style={collectionColumn}>
            <Img
              src="https://ashhadu.co.uk/images/collections/custom.jpg"
              width="120"
              height="120"
              alt="Custom Commissions"
              style={collectionImage}
            />
            <Text style={collectionTitle}>Custom Commissions</Text>
            <Text style={collectionDescription}>
              Personalized Islamic art pieces with your name or favorite verses
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Special Offer */}
      <Section style={offerContainer}>
        <Text style={offerHeading}>Welcome Gift 🎁</Text>
        <Text style={offerText}>
          As a welcome gift, enjoy <strong>10% off your first order</strong> with code:
        </Text>
        <Text style={couponCode}>WELCOME10</Text>
        <Text style={offerDetails}>
          Valid for 30 days • Minimum order £50 • Cannot be combined with other offers
        </Text>
        <Link href="https://ashhadu.co.uk/shop?utm_source=email&utm_campaign=welcome" style={shopButton}>
          Start Shopping
        </Link>
      </Section>

      {/* Why Choose Us */}
      <Section>
        <Text style={sectionHeading}>Why Choose Ashhadu Islamic Art?</Text>
        
        <Row style={featureRow}>
          <Column style={featureColumn}>
            <Text style={featureIcon}>🎨</Text>
            <Text style={featureTitle}>Authentic Designs</Text>
            <Text style={featureDescription}>
              Each piece is carefully designed with respect for Islamic traditions and artistic heritage
            </Text>
          </Column>
          <Column style={featureColumn}>
            <Text style={featureIcon}>⭐</Text>
            <Text style={featureTitle}>Premium Quality</Text>
            <Text style={featureDescription}>
              High-quality 3D printing with durable materials and beautiful finishes
            </Text>
          </Column>
        </Row>
        
        <Row style={featureRow}>
          <Column style={featureColumn}>
            <Text style={featureIcon}>🇬🇧</Text>
            <Text style={featureTitle}>UK Made</Text>
            <Text style={featureDescription}>
              Proudly designed and crafted in the United Kingdom with attention to detail
            </Text>
          </Column>
          <Column style={featureColumn}>
            <Text style={featureIcon}>📜</Text>
            <Text style={featureTitle}>Certificate Included</Text>
            <Text style={featureDescription}>
              Each piece comes with a certificate of authenticity and care instructions
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Getting Started */}
      <Section>
        <Text style={sectionHeading}>Getting Started</Text>
        <Text style={paragraph}>
          Here's how to make the most of your Ashhadu experience:
        </Text>
        
        <Section style={stepContainer}>
          <Text style={stepNumber}>1</Text>
          <Text style={stepText}>
            <strong>Browse our collections</strong> to find pieces that speak to your heart
          </Text>
        </Section>
        
        <Section style={stepContainer}>
          <Text style={stepNumber}>2</Text>
          <Text style={stepText}>
            <strong>Customize your order</strong> with personal names or favorite verses
          </Text>
        </Section>
        
        <Section style={stepContainer}>
          <Text style={stepNumber}>3</Text>
          <Text style={stepText}>
            <strong>Track your order</strong> from creation to your doorstep
          </Text>
        </Section>
        
        <Section style={stepContainer}>
          <Text style={stepNumber}>4</Text>
          <Text style={stepText}>
            <strong>Display with pride</strong> and enjoy your beautiful Islamic art
          </Text>
        </Section>
      </Section>

      {/* Action Buttons */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <Link href="https://ashhadu.co.uk/shop" style={primaryButton}>
          Explore Collections
        </Link>
        <Link href="https://ashhadu.co.uk/custom" style={secondaryButton}>
          Request Custom Piece
        </Link>
      </Section>

      {/* Newsletter */}
      <Section style={newsletterContainer}>
        <Text style={newsletterHeading}>Stay Connected</Text>
        <Text style={newsletterText}>
          Follow us on social media for inspiration, new arrivals, and special offers:
        </Text>
        <Row style={{ textAlign: 'center' as const, marginTop: '16px' }}>
          <Column>
            <Link href="https://instagram.com/ashhadu" style={socialLink}>Instagram</Link>
            {" | "}
            <Link href="https://facebook.com/ashhadu" style={socialLink}>Facebook</Link>
            {" | "}
            <Link href="https://twitter.com/ashhadu" style={socialLink}>Twitter</Link>
          </Column>
        </Row>
      </Section>

      {/* Support */}
      <Section style={{ marginTop: '32px', textAlign: 'center' as const }}>
        <Text style={supportText}>
          Have questions? We'd love to help you find the perfect Islamic art piece.<br />
          Email us at <Link href="mailto:support@ashhadu.co.uk" style={supportLink}>support@ashhadu.co.uk</Link>
          {" or call "}
          <Link href="tel:+447123456789" style={supportLink}>+44 7123 456 789</Link>
        </Text>
      </Section>
    </BaseEmailTemplate>
  );
}

// Styles
const heading = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 16px',
};

const subheading = {
  color: '#d4af37',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const sectionHeading = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '32px 0 16px',
  borderBottom: '2px solid #d4af37',
  paddingBottom: '8px',
};

const collectionRow = {
  margin: '16px 0',
};

const collectionColumn = {
  width: '50%',
  textAlign: 'center' as const,
  padding: '0 8px',
};

const collectionImage = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  margin: '0 0 12px',
};

const collectionTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const collectionDescription = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const offerContainer = {
  backgroundColor: '#d4af37',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const offerHeading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const offerText = {
  color: '#1a1a1a',
  fontSize: '16px',
  margin: '0 0 16px',
};

const couponCode = {
  backgroundColor: '#1a1a1a',
  color: '#d4af37',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '12px 24px',
  borderRadius: '6px',
  display: 'inline-block',
  margin: '0 0 16px',
  fontFamily: 'monospace',
};

const offerDetails = {
  color: '#1a1a1a',
  fontSize: '12px',
  margin: '0 0 20px',
};

const shopButton = {
  backgroundColor: '#1a1a1a',
  borderRadius: '6px',
  color: '#d4af37',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const featureRow = {
  margin: '16px 0',
};

const featureColumn = {
  width: '50%',
  textAlign: 'center' as const,
  padding: '0 8px',
};

const featureIcon = {
  fontSize: '32px',
  margin: '0 0 12px',
};

const featureTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const featureDescription = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const stepContainer = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '16px 0',
  padding: '16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const stepNumber = {
  backgroundColor: '#d4af37',
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 16px 0 0',
  flexShrink: 0,
};

const stepText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0 0',
};

const primaryButton = {
  backgroundColor: '#d4af37',
  borderRadius: '6px',
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 8px 16px',
};

const secondaryButton = {
  backgroundColor: 'transparent',
  border: '1px solid #d4af37',
  borderRadius: '6px',
  color: '#d4af37',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  margin: '0 8px 16px',
};

const newsletterContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const newsletterHeading = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const newsletterText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const socialLink = {
  color: '#d4af37',
  textDecoration: 'none',
  fontWeight: '500',
};

const supportText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const supportLink = {
  color: '#d4af37',
  textDecoration: 'none',
};