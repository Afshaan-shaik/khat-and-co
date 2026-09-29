import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Khath & Co caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear any broken hash and reset to main desk
    if (typeof window !== 'undefined') {
      window.location.hash = '';
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#1F2340',
            color: '#F8F3EA',
            fontFamily: "'Hanken Grotesk', sans-serif",
            textAlign: 'center'
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '36px 28px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '16px' }}>✉️</div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '10px' }}>
              A quiet pause on your desk
            </h2>
            <p style={{ color: '#D9CDBC', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
              Something paused while loading this view. Your drafts, letters, and saved writings are completely safe in your browser.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#9A2A3A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '999px',
                padding: '12px 28px',
                fontSize: '0.95rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
            >
              Return to your desk
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
