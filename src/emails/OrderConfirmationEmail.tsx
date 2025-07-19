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

interface OrderItem {
  id: string;
  name: string;
  arabic_name?: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  orderDate: string;
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  trackingUrl?: string;
}

export default function OrderConfirmationEmail({
  customerName,
  orderNumber,
  orderDate,
  orderItems,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  trackingUrl,
}: OrderConfirmationEmailProps) {
  return (
    <BaseEmailTemplate previewText={`Order confirmation for #${orderNumber}`}>
      {/* Header Message */}
      <Section>
        <Text style={heading}>Order Confirmation</Text>
        <Text style={subheading}>
          Thank you for your order, {customerName}!
        </Text>
        <Text style={paragraph}>
          We're excited to confirm that we've received your order for beautiful Islamic art pieces. 
          Your order is being processed and you'll receive another email when it ships.
        </Text>
      </Section>

      {/* Order Details Box */}
      <Section style={orderDetailsBox}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={orderDetailLabel}>Order Number</Text>
            <Text style={orderDetailValue}>#{orderNumber}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={orderDetailLabel}>Order Date</Text>
            <Text style={orderDetailValue}>{orderDate}</Text>
          </Column>
        </Row>
      </Section>

      {/* Order Items */}
      <Section>
        <Text style={sectionHeading}>Order Items</Text>
        {orderItems.map((item) => (
          <Section key={item.id} style={itemContainer}>
            <Row>
              {item.image_url && (
                <Column style={{ width: '80px' }}>
                  <Img
                    src={item.image_url}
                    width="70"
                    height="70"
                    alt={item.name}
                    style={itemImage}
                  />
                </Column>
              )}
              <Column style={{ paddingLeft: item.image_url ? '16px' : '0' }}>
                <Text style={itemName}>{item.name}</Text>
                {item.arabic_name && (
                  <Text style={itemArabicName} dir="rtl">
                    {item.arabic_name}
                  </Text>
                )}
                <Text style={itemDetails}>
                  Quantity: {item.quantity} × £{item.price.toFixed(2)}
                </Text>
              </Column>
              <Column style={{ textAlign: 'right' as const, width: '100px' }}>
                <Text style={itemTotal}>
                  £{(item.price * item.quantity).toFixed(2)}
                </Text>
              </Column>
            </Row>
          </Section>
        ))}
      </Section>

      {/* Order Summary */}
      <Section style={summaryContainer}>
        <Text style={sectionHeading}>Order Summary</Text>
        <Row style={summaryRow}>
          <Column>
            <Text style={summaryLabel}>Subtotal</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={summaryValue}>£{subtotal.toFixed(2)}</Text>
          </Column>
        </Row>
        <Row style={summaryRow}>
          <Column>
            <Text style={summaryLabel}>Shipping</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={summaryValue}>
              {shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}
            </Text>
          </Column>
        </Row>
        <Row style={summaryRow}>
          <Column>
            <Text style={summaryLabel}>VAT (20%)</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={summaryValue}>£{tax.toFixed(2)}</Text>
          </Column>
        </Row>
        <Row style={{ ...summaryRow, borderTop: '2px solid #d4af37' }}>
          <Column>
            <Text style={totalLabel}>Total</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={totalValue}>£{total.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Shipping Address */}
      <Section>
        <Text style={sectionHeading}>Shipping Address</Text>
        <Section style={addressContainer}>
          <Text style={addressText}>
            {shippingAddress.name}<br />
            {shippingAddress.address}<br />
            {shippingAddress.city}, {shippingAddress.postalCode}<br />
            {shippingAddress.country}
          </Text>
        </Section>
      </Section>

      {/* Action Buttons */}
      <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
        <Link href={`https://ashhadu.co.uk/account/orders/${orderNumber}`} style={primaryButton}>
          View Order Details
        </Link>
        {trackingUrl && (
          <Link href={trackingUrl} style={secondaryButton}>
            Track Your Order
          </Link>
        )}
      </Section>

      {/* Additional Information */}
      <Section style={{ marginTop: '32px' }}>
        <Text style={infoHeading}>What happens next?</Text>
        <Text style={paragraph}>
          • We'll prepare your Islamic art pieces with care<br />
          • You'll receive a shipping confirmation with tracking details<br />
          • Your order will be delivered within 3-5 business days<br />
          • Each piece comes with a certificate of authenticity
        </Text>
      </Section>

      {/* Support */}
      <Section style={{ marginTop: '32px', textAlign: 'center' as const }}>
        <Text style={supportText}>
          Questions about your order? We're here to help!<br />
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

const orderDetailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const orderDetailLabel = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 4px',
};

const orderDetailValue = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const sectionHeading = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '32px 0 16px',
  borderBottom: '2px solid #d4af37',
  paddingBottom: '8px',
};

const itemContainer = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 12px',
};

const itemImage = {
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
};

const itemName = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const itemArabicName = {
  color: '#d4af37',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0 0 8px',
  fontFamily: 'Amiri, serif',
};

const itemDetails = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const itemTotal = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const summaryContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const summaryRow = {
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '8px',
  marginBottom: '8px',
};

const summaryLabel = {
  color: '#374151',
  fontSize: '14px',
  margin: '0',
};

const summaryValue = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const totalLabel = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '8px 0 0',
};

const totalValue = {
  color: '#d4af37',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '8px 0 0',
};

const addressContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
};

const addressText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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

const infoHeading = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
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