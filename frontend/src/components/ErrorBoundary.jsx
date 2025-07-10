import React from 'react'
import Button from './ui/Button'
import Card from './ui/Card'
import { announcements } from '../utils/accessibility'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: `error-${Date.now()}`
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application Error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Announce error to screen readers
    announcements.announceError(error.message, 'application')

    // Report error to monitoring service (if available)
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: true
      })
    }
  }

  handleRestart = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    })
    
    // Announce recovery to screen readers
    announcements.announce('Application restarted successfully')
    
    // Reload the page as a last resort
    window.location.reload()
  }

  handleReportError = () => {
    const errorReport = {
      error: this.state.error?.toString(),
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    }

    // Copy error report to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        announcements.announce('Error report copied to clipboard')
      })
      .catch(() => {
        announcements.announce('Failed to copy error report')
      })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen bg-space-gradient flex items-center justify-center p-4"
          role="alert"
          aria-labelledby={`${this.state.errorId}-title`}
          aria-describedby={`${this.state.errorId}-description`}
        >
          <Card variant="glow" className="max-w-2xl w-full">
            <Card.Header>
              <div className="text-center mb-4">
                <div className="text-6xl mb-4" role="img" aria-label="Error icon">
                  🚨
                </div>
                <h1 
                  id={`${this.state.errorId}-title`}
                  className="text-3xl font-bold text-red-400 mb-2"
                >
                  Mission Control Error
                </h1>
                <p 
                  id={`${this.state.errorId}-description`}
                  className="text-gray-300 text-lg"
                >
                  Houston, we have a problem. The application encountered an unexpected error.
                </p>
              </div>
            </Card.Header>

            <Card.Content>
              {/* Error message */}
              {this.state.error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <h2 className="text-lg font-semibold text-red-400 mb-2">
                    Error Details:
                  </h2>
                  <p className="text-red-300 font-mono text-sm break-words">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={this.handleRestart}
                  variant="primary"
                  size="lg"
                  className="flex-1 sm:flex-none"
                  aria-describedby="restart-description"
                >
                  🚀 Restart Mission
                </Button>
                
                <Button 
                  onClick={this.handleReportError}
                  variant="secondary"
                  size="lg"
                  className="flex-1 sm:flex-none"
                  aria-describedby="report-description"
                >
                  📋 Copy Error Report
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  size="lg"
                  className="flex-1 sm:flex-none"
                  aria-describedby="home-description"
                >
                  🏠 Return Home
                </Button>
              </div>

              {/* Hidden descriptions for screen readers */}
              <div className="sr-only">
                <div id="restart-description">
                  Restart the application and attempt to recover from the error
                </div>
                <div id="report-description">
                  Copy technical error details to clipboard for reporting
                </div>
                <div id="home-description">
                  Navigate to the home page and start fresh
                </div>
              </div>

              {/* Development error details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-gray-400 hover:text-white transition-colors">
                    🔧 Development Error Details
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">
                        Error Stack:
                      </h3>
                      <pre className="text-xs text-red-300 bg-gray-900 p-3 rounded overflow-auto max-h-40">
                        {this.state.error.stack}
                      </pre>
                    </div>
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-300 mb-2">
                          Component Stack:
                        </h3>
                        <pre className="text-xs text-yellow-300 bg-gray-900 p-3 rounded overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </Card.Content>

            <Card.Footer>
              <div className="text-center text-sm text-gray-400">
                <p>
                  If this problem persists, please contact mission control support.
                </p>
                <p className="mt-1">
                  Error ID: <span className="font-mono">{this.state.errorId}</span>
                </p>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary(Component, fallback = null) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for error reporting
export function useErrorHandler() {
  const handleError = React.useCallback((error, errorInfo = {}) => {
    console.error('Handled Error:', error, errorInfo)
    
    // Announce error to screen readers
    announcements.announceError(error.message || error.toString())
    
    // Report to monitoring service
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      })
    }
  }, [])

  return handleError
}

export default ErrorBoundary