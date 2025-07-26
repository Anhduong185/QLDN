import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Row, Col, Statistic, Table, Progress, Alert, Spin } from 'antd';
import { 
    UserOutlined, 
    TeamOutlined, 
    ClockCircleOutlined, 
    CalendarOutlined,
    WarningOutlined,
    LineChartOutlined,
    BarChartOutlined
} from '@ant-design/icons';

const StatisticsDashboard = () => {
    const [basicStats, setBasicStats] = useState(null);
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [leaveStats, setLeaveStats] = useState(null);
    const [advancedAIStats, setAdvancedAIStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadAllStats();
    }, []);

    const loadAllStats = async () => {
        setLoading(true);
        try {
            const [basicRes, attendanceRes, leaveRes, advancedRes] = await Promise.all([
                axios.get('http://localhost:8000/api/statistics/basic-stats'),
                axios.get('http://localhost:8000/api/statistics/attendance-stats'),
                axios.get('http://localhost:8000/api/statistics/leave-stats'),
                axios.get('http://localhost:8000/api/statistics/advanced-ai-stats')
            ]);

            if (basicRes.data.success) setBasicStats(basicRes.data.data);
            if (attendanceRes.data.success) setAttendanceStats(attendanceRes.data.data);
            if (leaveRes.data.success) setLeaveStats(leaveRes.data.data);
            if (advancedRes.data.success) setAdvancedAIStats(advancedRes.data.data);
        } catch (error) {
            console.error('Lỗi khi tải thống kê:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cột cho bảng top nhân viên đi muộn
    const lateColumns = [
        {
            title: 'Tên nhân viên',
            dataIndex: 'ten',
            key: 'ten',
        },
        {
            title: 'Số lần đi muộn',
            dataIndex: 'late_count',
            key: 'late_count',
            sorter: (a, b) => a.late_count - b.late_count,
        },
        {
            title: 'Đi muộn TB (phút)',
            dataIndex: 'avg_late_minutes',
            key: 'avg_late_minutes',
            render: (value) => Math.round(value || 0),
        },
    ];

    // Cột cho bảng top nhân viên nghỉ nhiều
    const leaveColumns = [
        {
            title: 'Tên nhân viên',
            dataIndex: 'ten',
            key: 'ten',
        },
        {
            title: 'Số lần nghỉ',
            dataIndex: 'leave_count',
            key: 'leave_count',
            sorter: (a, b) => a.leave_count - b.leave_count,
        },
    ];

    // Cột cho bảng dự đoán nghỉ việc
    const predictionColumns = [
        {
            title: 'Tên nhân viên',
            dataIndex: 'employee_name',
            key: 'employee_name',
        },
        {
            title: 'Điểm rủi ro',
            dataIndex: 'risk_score',
            key: 'risk_score',
            render: (value) => `${value}/100`,
        },
        {
            title: 'Mức độ rủi ro',
            dataIndex: 'risk_level',
            key: 'risk_level',
            render: (value) => {
                const color = value === 'high' ? 'red' : value === 'medium' ? 'orange' : 'green';
                return <span style={{ color }}>{value.toUpperCase()}</span>;
            },
        },
    ];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <p>Đang tải thống kê...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ marginBottom: '24px' }}>
                <BarChartOutlined /> Thống Kê Nhân Sự
            </h1>

            {/* Thống kê cơ bản */}
            <Card title="📊 Thống Kê Cơ Bản" style={{ marginBottom: '24px' }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Statistic
                            title="Tổng nhân viên"
                            value={basicStats?.total_employees || 0}
                            prefix={<UserOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Đang làm việc"
                            value={basicStats?.active_employees || 0}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Đã nghỉ việc"
                            value={basicStats?.left_employees || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Tỷ lệ nghỉ việc"
                            value={basicStats?.attrition_rate || 0}
                            suffix="%"
                            precision={2}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Thống kê hiệu suất */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={12}>
                    <Card title="⏰ Thống Kê Chấm Công" style={{ height: '100%' }}>
                        {attendanceStats?.current_month && (
                            <div>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Đi muộn TB (phút)"
                                            value={Math.round(attendanceStats.current_month.avg_late_minutes || 0)}
                                            prefix={<ClockCircleOutlined />}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Về sớm TB (phút)"
                                            value={Math.round(attendanceStats.current_month.avg_early_minutes || 0)}
                                            prefix={<ClockCircleOutlined />}
                                        />
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginTop: '16px' }}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Giờ làm TB"
                                            value={Math.round(attendanceStats.current_month.avg_work_hours || 0)}
                                            suffix="giờ/ngày"
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic
                                            title="Tăng ca"
                                            value={Math.round(attendanceStats.current_month.total_overtime_hours || 0)}
                                            suffix="giờ"
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="📅 Thống Kê Nghỉ Phép" style={{ height: '100%' }}>
                        {leaveStats?.current_month_leaves && (
                            <div>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Statistic
                                            title="Tổng đơn"
                                            value={leaveStats.current_month_leaves.total_requests || 0}
                                            prefix={<CalendarOutlined />}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Đã duyệt"
                                            value={leaveStats.current_month_leaves.approved_requests || 0}
                                            valueStyle={{ color: '#3f8600' }}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Từ chối"
                                            value={leaveStats.current_month_leaves.rejected_requests || 0}
                                            valueStyle={{ color: '#cf1322' }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Bảng top nhân viên */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={12}>
                    <Card title="🏆 Top 5 Nhân Viên Đi Muộn Nhiều Nhất">
                        <Table
                            dataSource={attendanceStats?.top_late_employees || []}
                            columns={lateColumns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card title="🏆 Top 5 Nhân Viên Nghỉ Nhiều Nhất">
                        <Table
                            dataSource={leaveStats?.top_leave_employees || []}
                            columns={leaveColumns}
                            pagination={false}
                            size="small"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Thống kê AI nâng cao */}
            <Card title="🤖 Phân Tích AI Nâng Cao" style={{ marginBottom: '24px' }}>
                {advancedAIStats && (
                    <div>
                        <Row gutter={16} style={{ marginBottom: '24px' }}>
                            <Col span={8}>
                                <Card size="small" title="Dự Báo Nghỉ Việc">
                                    <Statistic
                                        title="Rủi ro cao"
                                        value={advancedAIStats.attrition_prediction?.high_risk_count || 0}
                                        valueStyle={{ color: '#cf1322' }}
                                    />
                                    <Statistic
                                        title="Rủi ro trung bình"
                                        value={advancedAIStats.attrition_prediction?.medium_risk_count || 0}
                                        valueStyle={{ color: '#fa8c16' }}
                                    />
                                    <Statistic
                                        title="Rủi ro thấp"
                                        value={advancedAIStats.attrition_prediction?.low_risk_count || 0}
                                        valueStyle={{ color: '#3f8600' }}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" title="Phân Tích Rủi Ro">
                                    <Statistic
                                        title="Đi muộn nhiều"
                                        value={advancedAIStats.risk_analysis?.late_risk_count || 0}
                                        prefix={<WarningOutlined />}
                                    />
                                    <Statistic
                                        title="Nghỉ phép nhiều"
                                        value={advancedAIStats.risk_analysis?.leave_risk_count || 0}
                                        prefix={<WarningOutlined />}
                                    />
                                    <Statistic
                                        title="Làm ít giờ"
                                        value={advancedAIStats.risk_analysis?.work_hour_risk_count || 0}
                                        prefix={<WarningOutlined />}
                                    />
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" title="Xu Hướng">
                                    <div style={{ textAlign: 'center' }}>
                                        <LineChartOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                                        <p>Dữ liệu xu hướng 6 tháng</p>
                                        <p>Chấm công: {advancedAIStats.attendance_trend?.length || 0} tháng</p>
                                        <p>Nghỉ phép: {advancedAIStats.leave_trend?.length || 0} tháng</p>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* Bảng dự đoán nghỉ việc */}
                        <Card title="📋 Danh Sách Dự Đoán Nghỉ Việc" size="small">
                            <Table
                                dataSource={advancedAIStats.attrition_prediction?.predictions || []}
                                columns={predictionColumns}
                                pagination={{ pageSize: 5 }}
                                size="small"
                            />
                        </Card>
                    </div>
                )}
            </Card>

            {/* Cảnh báo */}
            {advancedAIStats?.risk_analysis?.total_risk_employees > 0 && (
                <Alert
                    message="⚠️ Cảnh Báo"
                    description={`Có ${advancedAIStats.risk_analysis.total_risk_employees} nhân viên có dấu hiệu rủi ro cần quan tâm.`}
                    type="warning"
                    showIcon
                    style={{ marginBottom: '24px' }}
                />
            )}
        </div>
    );
};

export default StatisticsDashboard; 