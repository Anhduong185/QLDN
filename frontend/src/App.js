import React, { Suspense } from 'react';
import { ConfigProvider, Spin } from 'antd';
import MainLayout from './components/Layout/MainLayout';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#ff4d4f', marginBottom: '16px' }}>
            🚨 Đã xảy ra lỗi
          </h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Rất tiếc, đã có lỗi xảy ra trong ứng dụng. Vui lòng thử tải lại trang.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1890ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔄 Tải lại trang
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '24px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#1890ff' }}>
                Chi tiết lỗi (Development)
              </summary>
              <pre style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '6px',
                overflow: 'auto',
                fontSize: '12px',
                marginTop: '8px'
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: '#f0f2f5'
  }}>
    <Spin size="large" />
    <p style={{ marginTop: '16px', color: '#666' }}>
      Đang tải ứng dụng...
    </p>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          },
        }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <MainLayout />
        </Suspense>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;