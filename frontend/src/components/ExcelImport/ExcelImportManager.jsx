import React, { useState } from 'react';
import { 
  Upload, 
  Button, 
  Card, 
  Progress, 
  Alert, 
  Table, 
  Tag, 
  Space, 
  Typography,
  Modal,
  message,
  Spin
} from 'antd';
import { 
  UploadOutlined, 
  RobotOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ExcelImportManager = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleImport = async (file) => {
    setImporting(true);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('auto_process', 'true');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('http://localhost:8000/api/excel-import/nhan-vien', {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      
      if (data.success) {
        setResult(data);
        message.success(`Import thành công ${data.processed} nhân viên!`);
      } else {
        message.error('Lỗi import: ' + data.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      message.error('Lỗi kết nối server');
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const handlePreview = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('auto_process', 'false');

    try {
      const response = await fetch('http://localhost:8000/api/excel-import/nhan-vien', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setPreviewData(data);
        setPreviewModal(true);
      } else {
        message.error('Lỗi preview: ' + data.message);
      }
    } catch (error) {
      console.error('Preview error:', error);
      message.error('Lỗi kết nối server');
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/excel-import/template');
      const data = await response.json();
      
      if (data.success) {
        // Create CSV content
        const headers = data.template.headers.join(',');
        const sampleRow = data.template.sample_data[0].join(',');
        const csvContent = `${headers}\n${sampleRow}`;
        
        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_nhan_vien.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        
        message.success('Đã tải template!');
      }
    } catch (error) {
      message.error('Lỗi tải template');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls,.csv,.txt',
    beforeUpload: (file) => {
      // Kiểm tra file type
      const allowedTypes = ['xlsx', 'xls', 'csv', 'txt'];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        message.error(`File không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`);
        return false;
      }

      // Kiểm tra file size (10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File phải nhỏ hơn 10MB!');
        return false;
      }

      return false; // Prevent auto upload
    },
    onChange: (info) => {
      if (info.fileList.length > 0) {
        const file = info.fileList[0].originFileObj;
        handleImport(file);
      }
    }
  };

  const successColumns = [
    { title: 'Dòng', dataIndex: 'row', key: 'row' },
    { title: 'Mã NV', dataIndex: 'ma_nhan_vien', key: 'ma_nhan_vien' },
    { title: 'Tên', dataIndex: 'ten', key: 'ten' },
    { 
      title: 'Trạng thái', 
      key: 'status',
      render: () => <Tag color="green" icon={<CheckCircleOutlined />}>Thành công</Tag>
    }
  ];

  const errorColumns = [
    { title: 'Dòng', dataIndex: 'row', key: 'row' },
    { title: 'Lỗi', dataIndex: 'error', key: 'error' },
    { 
      title: 'Trạng thái', 
      key: 'status',
      render: () => <Tag color="red" icon={<ExclamationCircleOutlined />}>Lỗi</Tag>
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <RobotOutlined style={{ marginRight: '8px' }} />
        AI Import Excel Nhân Viên
      </Title>

      <Card style={{ marginBottom: '24px' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong>📋 Hướng dẫn:</Text>
            <ul>
              <li>Upload file Excel/CSV chứa thông tin nhân viên</li>
              <li>AI sẽ tự động phân tích cấu trúc và mapping dữ liệu</li>
              <li>Hệ thống validate và tạo nhân viên tự động</li>
              <li>Hỗ trợ format: .xlsx, .xls, .csv, .txt</li>
              <li>File size tối đa: 10MB</li>
            </ul>
          </div>

          <Button 
            type="primary" 
            icon={<DownloadOutlined />}
            onClick={downloadTemplate}
          >
            Tải Template Excel
          </Button>

          <Dragger {...uploadProps} disabled={importing}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Click hoặc kéo file Excel vào đây</p>
            <p className="ant-upload-hint">
              Hỗ trợ: .xlsx, .xls, .csv, .txt (tối đa 10MB)
            </p>
          </Dragger>
        </Space>
      </Card>

      {importing && (
        <Card style={{ marginBottom: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong>🔄 AI đang xử lý...</Text>
            <Progress percent={progress} status="active" />
            <Text type="secondary">
              AI đang phân tích cấu trúc Excel và validate dữ liệu
            </Text>
          </Space>
        </Card>
      )}

      {result && (
        <Card>
          <Title level={3}>📊 Kết Quả Import</Title>
          
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Alert
              message={`Import thành công ${result.processed}/${result.total_rows} nhân viên`}
              type="success"
              showIcon
            />

            {result.success_list && result.success_list.length > 0 && (
              <div>
                <Text strong>✅ Nhân viên đã tạo:</Text>
                <Table
                  dataSource={result.success_list}
                  columns={successColumns}
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </div>
            )}

            {result.errors && result.errors.length > 0 && (
              <div>
                <Text strong>❌ Lỗi:</Text>
                <Table
                  dataSource={result.errors}
                  columns={errorColumns}
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </div>
            )}
          </Space>
        </Card>
      )}

      <Modal
        title="Preview Dữ Liệu"
        open={previewModal}
        onCancel={() => setPreviewModal(false)}
        footer={null}
        width={800}
      >
        {previewData && (
          <div>
            <Alert
              message={`AI đã phân tích ${previewData.total_rows} dòng dữ liệu`}
              type="info"
              style={{ marginBottom: '16px' }}
            />
            
            <Text strong>Mapping được AI đề xuất:</Text>
            <pre style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px' }}>
              {JSON.stringify(previewData.analysis.mapping, null, 2)}
            </pre>
            
            <Text strong style={{ display: 'block', marginTop: '16px' }}>Preview dữ liệu:</Text>
            <Table
              dataSource={previewData.preview.map((row, index) => ({
                key: index,
                row: index + 2,
                data: row.join(', ')
              }))}
              columns={[
                { title: 'Dòng', dataIndex: 'row', key: 'row' },
                { title: 'Dữ liệu', dataIndex: 'data', key: 'data' }
              ]}
              pagination={false}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExcelImportManager; 