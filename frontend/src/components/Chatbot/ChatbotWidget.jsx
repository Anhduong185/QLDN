import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Avatar, Typography, Spin, message, Select, Tooltip } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CloseOutlined, SettingOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState('gemini-pro');
  const [availableModels, setAvailableModels] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load available models on component mount
  useEffect(() => {
    if (isOpen) {
      loadAvailableModels();
    }
  }, [isOpen]);

  const loadAvailableModels = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/chatbot/models');
      const data = await response.json();
      
      if (data.success) {
        setAvailableModels(data.models);
        setCurrentModel(data.current_model);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const switchModel = async (model) => {
    try {
      const response = await fetch('http://localhost:8000/api/chatbot/switch-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentModel(data.current_model);
        message.success('Đã chuyển sang model: ' + model);
      } else {
        message.error('Lỗi chuyển model: ' + data.message);
      }
    } catch (error) {
      message.error('Lỗi kết nối khi chuyển model');
    }
  };

  // Welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: 'Xin chào! Tôi là AI Assistant của hệ thống QLNS. Tôi có thể giúp bạn:\n\n• Tìm hiểu về chấm công\n• Hướng dẫn sử dụng hệ thống\n• Phân tích dữ liệu nhân sự\n• Trả lời câu hỏi về quy trình\n\nBạn có thể hỏi tôi bất cứ điều gì!',
          timestamp: new Date()
        }
      ]);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('http://localhost:8000/api/chatbot/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          context: 'QLNS System Assistant'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();
      
      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message || 'Lỗi kết nối');
      }
    } catch (error) {
      console.error('💥 Chatbot error:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ admin.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.';
      }
      
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      message.error('Lỗi kết nối chatbot: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<RobotOutlined />}
        onClick={toggleChatbot}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          background: '#1890ff',
          border: 'none'
        }}
      />

      {/* Chatbot Widget */}
      {isOpen && (
        <Card
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '20px',
            width: '380px',
            height: '550px',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column'
          }}
          bodyStyle={{
            padding: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                icon={<RobotOutlined />}
                style={{ backgroundColor: '#1890ff', marginRight: '8px' }}
              />
              <div>
                <Text strong>AI Assistant</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Powered by {currentModel}
                </Text>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Tooltip title="Cài đặt model">
                <Button
                  type="text"
                  icon={<SettingOutlined />}
                  onClick={toggleSettings}
                  size="small"
                />
              </Tooltip>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={toggleChatbot}
                size="small"
              />
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #e9ecef'
            }}>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                Chọn Model AI:
              </Text>
              <Select
                value={currentModel}
                onChange={switchModel}
                style={{ width: '100%' }}
                size="small"
              >
                {Object.entries(availableModels).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '16px',
            padding: '8px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  marginBottom: '12px',
                  justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: msg.type === 'user' ? '#1890ff' : '#fff',
                  color: msg.type === 'user' ? '#fff' : '#333',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  <div style={{ marginBottom: '4px' }}>
                    {msg.type === 'user' ? (
                      <UserOutlined style={{ marginRight: '4px' }} />
                    ) : (
                      <RobotOutlined style={{ marginRight: '4px' }} />
                    )}
                    <Text style={{ fontSize: '12px', opacity: 0.7 }}>
                      {msg.type === 'user' ? 'Bạn' : 'AI Assistant'}
                    </Text>
                  </div>
                  <div>{msg.content}</div>
                  <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
                    {msg.timestamp.toLocaleTimeString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{
                display: 'flex',
                marginBottom: '12px',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <Spin size="small" />
                  <Text style={{ marginLeft: '8px' }}>AI đang suy nghĩ...</Text>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập câu hỏi của bạn..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              style={{ alignSelf: 'flex-end' }}
            />
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatbotWidget; 