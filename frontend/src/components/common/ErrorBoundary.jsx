// src/components/common/ErrorBoundary.jsx
// Aurora Design System — Error boundary with branded fallback
// Class component required by React for getDerivedStateFromError.
// Updated: uses Aurora tokens, Button component, no gradient-clip text.
import { Component } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import Button from './Button'
import logger from '@/utils/logger'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Send to backend log pipeline in production; console in development
    logger.error(error, {
      componentStack: info?.componentStack?.slice(0, 2000) || '',
      context: 'ErrorBoundary',
    })
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--color-surface-base)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            maxWidth: 460,
            padding: '3rem 2rem',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border-default)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Error icon */}
          <div style={{
            width: 64,
            height: 64,
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            background: 'var(--color-rose-dim)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--color-rose-500)',
          }}>
            <AlertTriangle size={30} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: 'var(--font-size-h2)',
            fontWeight: 800,
            marginBottom: '0.75rem',
            color: 'var(--color-text-primary)',
          }}>
            Something went off course
          </h1>

          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-body)',
            lineHeight: 'var(--line-height-body)',
            marginBottom: '2rem',
          }}>
            An unexpected error interrupted this page. Your trips are safe — try reloading,
            or head back to your dashboard.
          </p>

          {/* Dev-only error stack */}
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              textAlign: 'left',
              fontSize: 'var(--font-size-caption)',
              color: 'var(--color-rose-400)',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              maxHeight: 160,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" icon={<RotateCcw size={16} />} onClick={this.handleReload}>
              Reload page
            </Button>
            <a href="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" icon={<Home size={16} />}>
                Go to dashboard
              </Button>
            </a>
          </div>
        </div>
      </div>
    )
  }
}
