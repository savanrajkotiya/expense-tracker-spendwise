import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          padding: '24px',
          textAlign: 'center',
          gap: '16px',
        }}>
          <span style={{ fontSize: '3rem' }}>😵</span>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text-heading)' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <Button onClick={this.handleReset}>Try Again</Button>
        </div>
      )
    }

    return this.props.children
  }
}
