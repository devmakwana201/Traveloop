import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useTranslation } from '../i18n'
import { Camera, Eye, EyeOff, Globe } from 'lucide-react'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: 12,
  fontSize: 14,
  color: '#111827',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'Inter, system-ui, sans-serif',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  marginBottom: 6,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
}

export default function RegisterPage(): React.ReactElement {
  const { t } = useTranslation()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [additionalInfo, setAdditionalInfo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState<string>('')

  const photoRef = useRef<HTMLInputElement>(null)
  const { register } = useAuthStore()
  const navigate = useNavigate()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPhotoPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    try {
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}`.replace(/\s+/g, '') || email.split('@')[0]
      await register(username, email, password)
      navigate('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getFocusStyle = (name: string): React.CSSProperties =>
    focused === name
      ? { borderColor: '#0ea5e9', boxShadow: '0 0 0 3px rgba(14,165,233,0.12)' }
      : {}

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: 600 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'white', borderRadius: 16,
            padding: '10px 20px',
            boxShadow: '0 2px 12px rgba(14,165,233,0.12)',
            border: '1px solid rgba(14,165,233,0.15)',
          }}>
            <Globe size={22} color="#0ea5e9" />
            <span style={{ fontSize: 20, fontWeight: 800, color: '#0ea5e9', letterSpacing: '-0.5px' }}>
              Traveloop
            </span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          borderRadius: 24,
          boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
          overflow: 'hidden',
          border: '1px solid rgba(14,165,233,0.12)',
        }}>
          {/* Card Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            padding: '28px 32px 24px',
            textAlign: 'center',
          }}>
            {/* Profile Photo */}
            <div
              onClick={() => photoRef.current?.click()}
              style={{
                width: 90, height: 90,
                borderRadius: '50%',
                background: photoPreview ? 'transparent' : 'rgba(255,255,255,0.2)',
                border: '3px solid rgba(255,255,255,0.6)',
                margin: '0 auto 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'transform 0.2s, border-color 0.2s',
                position: 'relative',
              }}
              title="Click to upload photo"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  <Camera size={26} />
                  <div style={{ fontSize: 10, marginTop: 4, fontWeight: 600, opacity: 0.9 }}>Photo</div>
                </div>
              )}
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />

            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
              Create Your Account
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              Join Traveloop and start planning your next adventure
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '28px 32px 32px' }}>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 10, padding: '10px 14px',
                marginBottom: 20, fontSize: 13, color: '#dc2626',
              }}>
                {error}
              </div>
            )}

            {/* Row 1: First Name + Last Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="John"
                  required
                  style={{ ...inputStyle, ...getFocusStyle('firstName') }}
                  onFocus={() => setFocused('firstName')}
                  onBlur={() => setFocused('')}
                />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Doe"
                  required
                  style={{ ...inputStyle, ...getFocusStyle('lastName') }}
                  onFocus={() => setFocused('lastName')}
                  onBlur={() => setFocused('')}
                />
              </div>
            </div>

            {/* Row 2: Email + Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                  style={{ ...inputStyle, ...getFocusStyle('email') }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 99999 99999"
                  style={{ ...inputStyle, ...getFocusStyle('phone') }}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused('')}
                />
              </div>
            </div>

            {/* Row 3: City + Country */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Mumbai"
                  style={{ ...inputStyle, ...getFocusStyle('city') }}
                  onFocus={() => setFocused('city')}
                  onBlur={() => setFocused('')}
                />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="India"
                  style={{ ...inputStyle, ...getFocusStyle('country') }}
                  onFocus={() => setFocused('country')}
                  onBlur={() => setFocused('')}
                />
              </div>
            </div>

            {/* Additional Information */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Additional Information</label>
              <textarea
                value={additionalInfo}
                onChange={e => setAdditionalInfo(e.target.value)}
                placeholder="Tell us about your travel interests, preferred destinations, or anything else..."
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: 80,
                  lineHeight: 1.5,
                  ...(focused === 'info' ? { borderColor: '#0ea5e9', boxShadow: '0 0 0 3px rgba(14,165,233,0.12)' } : {}),
                }}
                onFocus={() => setFocused('info')}
                onBlur={() => setFocused('')}
              />
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #f3f4f6', margin: '16px 0', position: 'relative' }}>
              <span style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white', padding: '0 10px',
                fontSize: 11, color: '#9ca3af', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Security</span>
            </div>

            {/* Row 4: Password + Confirm */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    style={{ ...inputStyle, paddingRight: 42, ...getFocusStyle('password') }}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#9ca3af', padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  style={{ ...inputStyle, ...getFocusStyle('confirm') }}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused('')}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? '#7dd3fc' : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
                letterSpacing: '-0.2px',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Creating Account...
                </>
              ) : 'Register Users'}
            </button>

            {/* Sign In Link */}
            <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#6b7280' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{ color: '#0ea5e9', fontWeight: 700, textDecoration: 'none' }}
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
// Traveloop – Travel Planning Platform 2026
