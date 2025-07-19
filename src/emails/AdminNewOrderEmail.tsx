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

interface AdminNewOrderEmailProps {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderItems: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  orderId: string;
  urgent?: boolean;
}

export default function AdminNewOrderEmail({
  orderNumber,
  orderDate,
  customerName,
  customerEmail,
  customerPhone,
  orderItems,
  subtotal,
  shipping,
  tax,
  total,
  paymentMethod,
  paymentStatus,
  shippingAddress,
  billingAddress,
  orderId,
  urgent = false,
}: AdminNewOrderEmailProps) {
  const priorityLabel = urgent ? '[URGENT]' : '[NEW ORDER]';
  const priorityStyle = urgent ? urgentAlert : normalAlert;

  return (
    <BaseEmailTemplate previewText={`${priorityLabel} Order #${orderNumber} - ${customerName}`}>
      {/* Alert Banner */}
      <Section style={priorityStyle}>
        <Text style={alertText}>
          {urgent ? '🚨 URGENT ORDER' : '📦 NEW ORDER RECEIVED'}
        </Text>
      </Section>

      {/* Header */}
      <Section>
        <Text style={heading}>New Order Notification</Text>
        <Text style={subheading}>
          Order #{orderNumber} requires your attention
        </Text>
      </Section>

      {/* Quick Actions */}
      <Section style={{ textAlign: 'center' as const, margin: '20px 0' }}>
        <Link href={`https://ashhadu.co.uk/admin/orders/${orderId}`} style={primaryButton}>
          View Order in Admin
        </Link>
        <Link href={`https://ashhadu.co.uk/admin/orders/${orderId}/fulfill`} style={secondaryButton}>
          Start Fulfillment
        </Link>
      </Section>

      {/* Order Summary */}
      <Section style={summaryContainer}>
        <Row>
          <Column style={{ width: '50%' }}>
            <Text style={summaryLabel}>Order Number</Text>
            <Text style={summaryValue}>#{orderNumber}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={summaryLabel}>Order Date</Text>
            <Text style={summaryValue}>{orderDate}</Text>
          </Column>
        </Row>
        <Row style={{ marginTop: '16px' }}>
          <Column style={{ width: '50%' }}>
            <Text style={summaryLabel}>Total Amount</Text>
            <Text style={totalValue}>£{total.toFixed(2)}</Text>
          </Column>
          <Column style={{ width: '50%' }}>
            <Text style={summaryLabel}>Payment Status</Text>
            <Text style={paymentStatus === 'paid' ? paidStatus : pendingStatus}>
              {paymentStatus.toUpperCase()}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Customer Information */}
      <Section>
        <Text style={sectionHeading}>Customer Information</Text>
        <Section style={infoContainer}>
          <Row>
            <Column style={{ width: '50%' }}>
              <Text style={infoLabel}>Name</Text>
              <Text style={infoValue}>{customerName}</Text>
              
              <Text style={infoLabel}>Email</Text>
              <Text style={infoValue}>
                <Link href={`mailto:${customerEmail}`} style={infoLink}>
                  {customerEmail}
                </Link>
              </Text>
              
              {customerPhone && (
                <>
                  <Text style={infoLabel}>Phone</Text>
                  <Text style={infoValue}>
                    <Link href={`tel:${customerPhone}`} style={infoLink}>
                      {customerPhone}
                    </Link>
                  </Text>
                </>
              )}
            </Column>
            <Column style={{ width: '50%' }}>
              <Text style={infoLabel}>Payment Method</Text>
              <Text style={infoValue}>{paymentMethod}</Text>
              
              <Text style={infoLabel}>Customer Type</Text>
              <Text style={infoValue}>
                {customerEmail.includes('@') ? 'Registered Customer' : 'Guest'}
              </Text>
            </Column>
          </Row>
        </Section>
      </Section>

      {/* Order Items */}
      <Section>
        <Text style={sectionHeading}>Order Items ({orderItems.length})</Text>
        {orderItems.map((item, index) => (
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
                <Text style={itemName}>
                  {index + 1}. {item.name}
                </Text>
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

      {/* Financial Summary */}
      <Section style={financialContainer}>
        <Text style={sectionHeading}>Financial Summary</Text>
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
            <Text style={adminTotalValue}>£{total.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      {/* Addresses */}
      <Section>
        <Row>
          <Column style={{ width: '50%', paddingRight: '8px' }}>
            <Text style={addressHeading}>Shipping Address</Text>
            <Section style={addressContainer}>
              <Text style={addressText}>
                {shippingAddress.name}<br />
                {shippingAddress.address}<br />
                {shippingAddress.city}, {shippingAddress.postalCode}<br />
                {shippingAddress.country}
              </Text>
            </Section>
          </Column>
          <Column style={{ width: '50%', paddingLeft: '8px' }}>
            <Text style={addressHeading}>Billing Address</Text>
            <Section style={addressContainer}>
              <Text style={addressText}>
                {billingAddress.name}<br />
                {billingAddress.address}<br />
                {billingAddress.city}, {billingAddress.postalCode}<br />
                {billingAddress.country}
              </Text>
            </Section>
          </Column>
        </Row>
      </Section>

      {/* Action Items */}
      <Section style={actionContainer}>
        <Text style={actionHeading}>Action Items</Text>
        <Section style={checklistItem}>
          <Text style={checkboxStyle}>☐</Text>
          <Text style={checklistText}>Verify payment received</Text>
        </Section>
        <Section style={checklistItem}>
          <Text style={checkboxStyle}>☐</Text>
          <Text style={checklistText}>Check inventory availability</Text>
        </Section>
        <Section style={checklistItem}>
          <Text style={checkboxStyle}>☐</Text>
          <Text style={checklistText}>Prepare items for shipping</Text>
        </Section>
        <Section style={checklistItem}>
          <Text style={checkboxStyle}>☐</Text>
          <Text style={checklistText}>Update order status</Text>
        </Section>
        <Section style={checklistItem}>
          <Text style={checkboxStyle}>☐</Text>
          <Text style={checklistText}>Send shipping confirmation to customer</Text>
        </Section>
      </Section>

      {/* Quick Links */}
      <Section style={quickLinksContainer}>
        <Text style={quickLinksHeading}>Quick Links</Text>
        <Row>
          <Column>
            <Link href={`https://ashhadu.co.uk/admin/orders/${orderId}`} style={quickLink}>
              View Order
            </Link>
            {" | "}
            <Link href={`https://ashhadu.co.uk/admin/customers/${customerEmail}`} style={quickLink}>
              Customer Profile
            </Link>
            {" | "}
            <Link href="https://ashhadu.co.uk/admin/inventory" style={quickLink}>
              Check Inventory
            </Link>
          </Column>
        </Row>
        <Row style={{ marginTop: '8px' }}>
          <Column>
            <Link href="https://ashhadu.co.uk/admin/shipping" style={quickLink}>
              Shipping Labels
            </Link>
            {" | "}
            <Link href="https://ashhadu.co.uk/admin/reports" style={quickLink}>
              Sales Reports
            </Link>
            {" | "}
            <Link href="https://ashhadu.co.uk/admin/dashboard" style={quickLink}>
              Admin Dashboard
            </Link>
          </Column>
        </Row>
      </Section>
    </BaseEmailTemplate>
  );
}

// Styles
const urgentAlert = {
  backgroundColor: '#ef4444',
  borderRadius: '6px',
  padding: '12px',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const normalAlert = {
  backgroundColor: '#d4af37',
  borderRadius: '6px',
  padding: '12px',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const alertText = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const heading = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 8px',
};

const subheading = {
  color: '#6b7280',
  fontSize: '16px',
  textAlign: 'center' as const,
  margin: '0 0 20px',
};

const primaryButton = {
  backgroundColor: '#d4af37',
  borderRadius: '6px',
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  margin: '0 8px 8px',
};

const secondaryButton = {
  backgroundColor: 'transparent',
  border: '1px solid #d4af37',
  borderRadius: '6px',
  color: '#d4af37',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 20px',
  margin: '0 8px 8px',
};

const summaryContainer = {
  backgroundColor: '#f9fafb',
  border: '2px solid #d4af37',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const summaryLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
};

const summaryValue = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const totalValue = {
  color: '#d4af37',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const paidStatus = {
  color: '#059669',
  fontSize: '14px',
  fontWeight: 'bold',
  backgroundColor: '#d1fae5',
  padding: '4px 8px',
  borderRadius: '4px',
  margin: '0',
};

const pendingStatus = {
  color: '#d97706',
  fontSize: '14px',
  fontWeight: 'bold',
  backgroundColor: '#fef3c7',
  padding: '4px 8px',
  borderRadius: '4px',
  margin: '0',
};

const sectionHeading = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 12px',
  borderBottom: '2px solid #d4af37',
  paddingBottom: '4px',
};

const infoContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '16px',
};

const infoLabel = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 4px',
  textTransform: 'uppercase' as const,
};

const infoValue = {
  color: '#1a1a1a',
  fontSize: '14px',
  margin: '0 0 12px',
};

const infoLink = {
  color: '#d4af37',
  textDecoration: 'none',
};

const itemContainer = {
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '12px',
  margin: '0 0 8px',
  backgroundColor: '#fafafa',
};

const itemImage = {
  borderRadius: '4px',
  border: '1px solid #e5e7eb',
};

const itemName = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const itemArabicName = {
  color: '#d4af37',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 6px',
  fontFamily: 'Amiri, serif',
};

const itemDetails = {
  color: '#6b7280',
  fontSize: '12px',
  margin: '0',
};

const itemTotal = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
};

const financialContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
};

const summaryRow = {
  borderBottom: '1px solid #e5e7eb',
  paddingBottom: '6px',
  marginBottom: '6px',
};

const totalLabel = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '6px 0 0',
};

const adminTotalValue = {
  color: '#d4af37',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '6px 0 0',
};

const addressHeading = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const addressContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '12px',
};

const addressText = {
  color: '#374151',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
};

const actionContainer = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
};

const actionHeading = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const checklistItem = {
  display: 'flex',
  alignItems: 'flex-start',
  margin: '8px 0',
};

const checkboxStyle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 8px 0 0',
  minWidth: '16px',
};

const checklistText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0',
};

const quickLinksContainer = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  padding: '16px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const quickLinksHeading = {
  color: '#1a1a1a',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const quickLink = {
  color: '#d4af37',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: '500',
};