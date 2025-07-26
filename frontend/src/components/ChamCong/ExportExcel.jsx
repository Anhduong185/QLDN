import React, { useState } from 'react';
import { Button, message } from 'antd';
import { chamCongService } from '../../services/chamCongService';

const ExportExcel = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await chamCongService.exportExcel({});
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cham_cong.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Xuất file thành công!');
    } catch {
      message.error('Xuất file thất bại!');
    }
    setLoading(false);
  };

  return (
    <Button type="primary" loading={loading} onClick={handleExport} style={{ margin: 16 }}>
      Xuất Excel chấm công
    </Button>
  );
};

export default ExportExcel; 