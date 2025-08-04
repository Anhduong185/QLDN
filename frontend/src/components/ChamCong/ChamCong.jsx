import React, { useState } from 'react';
import RegisterFace from './RegisterFace';
import CheckIn from './CheckIn';

const ChamCong = () => {
  const [activeTab, setActiveTab] = useState('checkin');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: 0
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setActiveTab('checkin')}
            style={{
              padding: '15px 30px',
              backgroundColor: activeTab === 'checkin' ? '#28a745' : 'transparent',
              color: activeTab === 'checkin' ? 'white' : '#6c757d',
              border: 'none',
              borderBottom: activeTab === 'checkin' ? '3px solid #28a745' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            ✅ Chấm công
          </button>

          <button
            onClick={() => setActiveTab('register')}
            style={{
              padding: '15px 30px',
              backgroundColor: activeTab === 'register' ? '#007bff' : 'transparent',
              color: activeTab === 'register' ? 'white' : '#6c757d',
              border: 'none',
              borderBottom: activeTab === 'register' ? '3px solid #007bff' : '3px solid transparent',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            📝 Đăng ký khuôn mặt
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'checkin' && <CheckIn />}
        {activeTab === 'register' && <RegisterFace />}
      </div>
    </div>
  );
};

export default ChamCong;
