'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SimpleSignUpPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    marketingConsent: false,
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signUp } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setErrors({ general: 'Please fill in all required fields' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors({ general: 'Passwords do not match' });
      return;
    }

    if (!formData.termsAccepted) {
      setErrors({ general: 'Please accept the terms and conditions' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { user, error } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        marketingConsent: formData.marketingConsent,
      });

      if (error) {
        setErrors({ general: error.message });
        return;
      }

      alert('Account created successfully! Please check your email to verify your account.');
      router.push('/login?message=account-created');
      
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Inline styles to ensure they work
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #374151 50%, #1a1a1a 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const formContainerStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  };

  const titleStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '10px',
    fontFamily: 'Georgia, serif'
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '16px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    marginBottom: '15px',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontSize: '16px',
    outline: 'none'
  };

  const inputFocusStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#d4af37',
    boxShadow: '0 0 0 2px rgba(212, 175, 55, 0.2)'
  };

  const labelStyle: React.CSSProperties = {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px',
    display: 'block'
  };

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 24px',
    backgroundColor: '#d4af37',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    marginTop: '20px'
  };

  const errorStyle: React.CSSProperties = {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '20px',
    color: '#f87171',
    fontSize: '14px'
  };

  const checkboxContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '15px',
    gap: '10px'
  };

  const checkboxStyle: React.CSSProperties = {
    marginTop: '2px'
  };

  const checkboxLabelStyle: React.CSSProperties = {
    color: '#d1d5db',
    fontSize: '14px',
    lineHeight: '1.4'
  };

  const linkStyle: React.CSSProperties = {
    color: '#d4af37',
    textDecoration: 'underline'
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '15px'
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h1 style={titleStyle}>Create Account</h1>
        <p style={subtitleStyle}>
          Join Ashhadu Islamic Art and discover authentic Islamic art
        </p>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div style={errorStyle}>
              {errors.general}
            </div>
          )}

          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="First name"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <label style={labelStyle}>Email Address *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            style={inputStyle}
            placeholder="Enter your email"
            required
          />

          <label style={labelStyle}>Phone Number (Optional)</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            style={inputStyle}
            placeholder="+44 or 07xxx xxx xxx"
          />

          <label style={labelStyle}>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            style={inputStyle}
            placeholder="Create a strong password"
            required
          />

          <label style={labelStyle}>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            style={inputStyle}
            placeholder="Confirm your password"
            required
          />

          <div style={checkboxContainerStyle}>
            <input
              type="checkbox"
              name="marketingConsent"
              checked={formData.marketingConsent}
              onChange={handleInputChange}
              style={checkboxStyle}
            />
            <label style={checkboxLabelStyle}>
              I would like to receive updates about new Islamic art pieces, special offers, and exclusive collections via email.
            </label>
          </div>

          <div style={checkboxContainerStyle}>
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              style={checkboxStyle}
              required
            />
            <label style={checkboxLabelStyle}>
              I agree to the{' '}
              <Link href="/terms" style={linkStyle}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" style={linkStyle}>
                Privacy Policy
              </Link>
              *
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#d1d5db', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link href="/login" style={linkStyle}>
              Sign in here
            </Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{ color: '#d1d5db', fontSize: '14px' }}>
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}