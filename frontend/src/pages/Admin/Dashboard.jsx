import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getOverviewStatsAction, getRevenueStatsAction, getGrowthTrendsAction,getCourseStatsAction } from '../../Redux/Statistic/Statistic.action';
import { Grid, Paper, Typography, Box, Card, CardContent, CircularProgress, Avatar, Chip, Button, Stack } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SchoolIcon from '@mui/icons-material/School';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { 
        overview, revenueStats, growthTrends, courseStats, loading 
    } = useSelector(store => store.statistic || {});

    const [revenueFilter, setRevenueFilter] = useState('12 Months');
    
    const PIE_COLORS = ['#00A76F', '#FFAB00', '#006C9C', '#FF5630'];

    useEffect(() => {
        dispatch(getOverviewStatsAction());
        dispatch(getRevenueStatsAction());
        dispatch(getGrowthTrendsAction('monthly'));
        dispatch(getCourseStatsAction());
    }, [dispatch]);

    const fillMissingMonths = (data, valueKey = 'value', labelKey = 'month', count = 12) => {
        const months = [];
        const today = new Date();
        
        for (let i = count - 1; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const compareDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            months.push({
                compareDate: compareDate,
                displayDate: `M${d.getMonth() + 1}`,
            });
        }

        return months.map(m => {
            const found = data?.find(item => {
                const itemDate = String(item[labelKey] || '').substring(0, 7);
                return itemDate === m.compareDate;
            });

            return {
                name: m.displayDate,
                [valueKey]: found ? Number(found[valueKey]) : 0, 
            };
        });
    };

    const processedRevenueData = useMemo(() => 
        fillMissingMonths(revenueStats?.monthlyRevenue, 'revenue', 'month', 12), 
    [revenueStats]);

    const processedUserData = useMemo(() => 
        fillMissingMonths(growthTrends?.userGrowth, 'count', 'period', 6), 
    [growthTrends]);

    const handleRevenueFilterChange = (label) => {
        setRevenueFilter(label);
        const endDate = new Date();
        const startDate = new Date();
        let filters = {};

        if (label === '7 Days') startDate.setDate(endDate.getDate() - 7);
        else if (label === '30 Days') startDate.setDate(endDate.getDate() - 30);
        
        if (label !== '12 Months') {
            filters = { 
                startDate: startDate.toISOString().split('T')[0], 
                endDate: endDate.toISOString().split('T')[0] 
            };
        }
        dispatch(getRevenueStatsAction(filters));
    };

    const formatCompact = (num) => {
        if (!num) return '0';
        return new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(num);
    };
    
    const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    const StatCard = ({ title, value, icon, color, bgColor }) => (
        <Card sx={{ 
            height: '100%', 
            borderRadius: '12px', 
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)', 
            bgcolor: '#FFFFFF',
            transition: '0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
        }}>
            <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2.5 }}>
                <Avatar sx={{ 
                    bgcolor: bgColor, color: color, 
                    width: 56, height: 56, borderRadius: '50%' 
                }}>
                    {icon}
                </Avatar>
                <Box>
                    <Typography variant="h5" fontWeight={800} color="#212B36">
                        {value}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#637381">
                        {title}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );

    const CustomTooltip = ({ active, payload, label, type }) => {
        if (active && payload && payload.length) {
            return (
                <Paper sx={{ p: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={0.5}>{label}</Typography>
                    {payload.map((entry, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={1}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
                            <Typography variant="body2" fontSize={13}>
                                {type === 'currency' ? formatCurrency(entry.value) : entry.value}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    if (loading && !overview) {
        return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><CircularProgress sx={{ color: '#00A76F' }} /></Box>;
    }

    const safeOverview = overview || {};
    const safeRevenue = revenueStats || {};
    const safeCourses = courseStats || {};

    return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#F4F6F8', minHeight: '100vh', fontFamily: 'Public Sans, sans-serif' }}>
        
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Box>
                <Typography variant="h4" fontWeight={800} color="#212B36">Dashboard</Typography>
                <Typography variant="body2" color="#637381">E-Learning System Overview</Typography>
            </Box>
        </Box>

        {/* Top Stat Cards Section */}
        <Grid container spacing={3} mb={4}>
            <Grid item size={{xs: 12, sm: 6, lg: 3}}>
                <StatCard title="Total Revenue" value={formatCompact(safeOverview?.revenue?.total)} icon={<AnalyticsIcon fontSize="large" />} color="#00A76F" bgColor="#D0F2E3" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3} size={{xs: 12, sm: 6, lg: 3}}>
                <StatCard title="Total Users" value={safeOverview?.users?.total || 0} icon={<GroupAddIcon fontSize="large" />} color="#006C9C" bgColor="#CAFDF5" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3} size={{xs: 12, sm: 6, lg: 3}}>
                <StatCard title="Total Courses" value={safeOverview?.courses?.published || 0} icon={<SchoolIcon fontSize="large" />} color="#FFAB00" bgColor="#FFF5CC" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3} size={{xs: 12, sm: 6, lg: 3}}>
                <StatCard title="Certificates Issued" value={safeOverview?.certificates?.issued || 0} icon={<VerifiedIcon fontSize="large" />} color="#FF5630" bgColor="#FFE7D9" />
            </Grid>
        </Grid>

        <Grid container spacing={3}>
            
            <Grid item xs={12} lg={8} size={{xs: 12, lg: 8}}>
                <Card sx={{ borderRadius: '12px', boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)', height: 450 }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6" fontWeight={700} color="#212B36">Revenue Analysis</Typography>
                            <Box bgcolor="#F4F6F8" p={0.5} borderRadius={1}>
                                {['12 Months', '30 Days', '7 Days'].map((label) => (
                                    <Chip 
                                        key={label} label={label} 
                                        onClick={() => handleRevenueFilterChange(label)}
                                        size="small"
                                        sx={{ 
                                            bgcolor: revenueFilter === label ? '#FFFFFF' : 'transparent', 
                                            color: revenueFilter === label ? '#212B36' : '#637381',
                                            fontWeight: 600, 
                                            boxShadow: revenueFilter === label ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                                            cursor: 'pointer', borderRadius: 1
                                        }} 
                                    />
                                ))}
                            </Box>
                        </Box>
                        <Box flex={1} minHeight={0}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={processedRevenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00A76F" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#00A76F" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#637381', fontSize: 12}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#637381', fontSize: 12}} tickFormatter={val => formatCompact(val)} />
                                    <Tooltip content={<CustomTooltip type="currency" />} />
                                    <Area type="monotone" dataKey="revenue" stroke="#00A76F" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4} size={{xs: 12, md: 6, lg: 4}}>
                <Card sx={{ borderRadius: '12px', boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)', height: 450 }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight={700} color="#212B36" mb={1}>New Users</Typography>
                        <Typography variant="body2" color="#637381" mb={4}>Last 6 months</Typography>
                        <Box flex={1} minHeight={0}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={processedUserData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#637381', fontSize: 12}} />
                                    <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                    <Bar dataKey="count" fill="#212B36" radius={[4, 4, 4, 4]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={8} size={{xs: 12, md: 6, lg: 8}}>
                <Card sx={{ borderRadius: '12px', boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)', height: '100%' }}>
                    <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" fontWeight={700} color="#212B36">Best Selling Courses</Typography>
                        <Button 
                            size="small" 
                            onClick={() => navigate('/admin/courses')}
                            endIcon={<ArrowForwardIcon fontSize="small" />}
                            sx={{ color: '#212B36', textTransform: 'none', fontWeight: 600 }}
                        >
                            View All
                        </Button>
                    </Box>
                    <Stack spacing={0}>
                        {safeCourses?.topCourses?.slice(0, 5).map((course, idx) => (
                            <Box key={idx} display="flex" alignItems="center" justifyContent="space-between" p={2} px={3}
                                sx={{ borderTop: '1px dashed #F1F3F4', '&:hover': { bgcolor: '#FAFAFA' }, transition: '0.2s' }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <Avatar variant="rounded" src={course.image || ''} sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: '#F4F6F8', color: '#637381', fontWeight: 700 }}>
                                        {idx + 1}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={700} color="#212B36" noWrap sx={{ maxWidth: {xs: 150, sm: 300} }}>
                                            {course.title}
                                        </Typography>
                                        <Typography variant="caption" color="#637381">{course.enrollments} students</Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" fontWeight={700} color="#00A76F">{formatCompact(course.priceVND)} ₫</Typography>
                            </Box>
                        ))}
                    </Stack>
                </Card>
            </Grid>

            <Grid item xs={12} md={6} lg={4} size={{xs: 12, md: 6, lg: 4}}>
                <Card sx={{ borderRadius: '12px', boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)', height: '100%', minHeight: 450 }}>
                    <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" fontWeight={700} color="#212B36" mb={3}>Revenue Source</Typography>
                        {safeRevenue.topCourses && safeRevenue.topCourses.length > 0 ? (
                            <>
                                <Box flex={1} minHeight={200}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={safeRevenue.topCourses?.slice(0, 4)} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="revenue" nameKey="courseTitle" stroke="none">
                                                {safeRevenue.topCourses?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Stack spacing={1.5} mt={2}>
                                    {safeRevenue.topCourses?.slice(0, 3).map((entry, index) => (
                                        <Box key={index} display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: PIE_COLORS[index % PIE_COLORS.length] }} />
                                                <Typography variant="body2" color="#637381" sx={{ maxWidth: 150 }} noWrap>{entry.courseTitle}</Typography>
                                            </Box>
                                            <Typography variant="body2" fontWeight={700} color="#212B36">{formatCompact(entry.revenue)}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </>
                        ) : (
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%"><Typography color="#637381">No data available</Typography></Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>

        </Grid>
    </Box>
);
};

export default Dashboard;