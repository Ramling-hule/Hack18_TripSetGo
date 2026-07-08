// src/components/domain/auth/SocialLogin.jsx
// Aurora Design System — Third-party authentication container (Google OAuth)
// Integrates the GoogleLogin component from @react-oauth/google.
import { GoogleLogin } from '@react-oauth/google'

export default function SocialLogin({ onGoogleSuccess, onGoogleError }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', margin: 'var(--spacing-6) 0' }}>
        <div style={{ height: '1px', background: 'var(--color-border-default)', flex: 1 }} />
        <span
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-caption)',
            fontFamily: 'var(--font-family-body)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
            flexShrink: 0,
          }}
        >
          or continue with
        </span>
        <div style={{ height: '1px', background: 'var(--color-border-default)', flex: 1 }} />
      </div>

      {/* Google Login button */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={onGoogleError || (() => {})}
          theme="filled_black"
          shape="rectangular"
          text="signin_with"
          width="100%"
        />
      </div>
    </div>
  )
}
