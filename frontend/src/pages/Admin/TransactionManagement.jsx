import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { Box, Typography, Paper, Chip, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Card,
         CardContent, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider } from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { getAllPaymentsAction, getPaymentStatsAction, getPaymentDetailAction } from '../../Redux/Payment/payment.action';

const TransactionManagement = () => {
    const dispatch = useDispatch();

    const { payments, stats, pagination, loading, currentPayment } = useSelector(store => store.payment);

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [statusFilter, setStatusFilter] = useState("");
    const [providerFilter, setProviderFilter] = useState("");
    
    const [openDetailModal, setOpenDetailModal] = useState(false);

    //lấy thông tin stats thanh toán
    useEffect(() => {
        dispatch(getPaymentStatsAction());
    }, [dispatch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPayments();
        }, 500);
        return () => clearTimeout(timer);
    }, [paginationModel, statusFilter, providerFilter]);

    const fetchPayments = () => {
        dispatch(getAllPaymentsAction(
            paginationModel.page + 1,
            paginationModel.pageSize,
            { 
                status: statusFilter,
                provider: providerFilter
            }
        ));
    };

    const handleViewDetail = (id) => {
        dispatch(getPaymentDetailAction(id));
        setOpenDetailModal(true);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 50 },
        { 
            field: 'user', 
            headerName: 'User', 
            width: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', pt: '5px' }}>
                    <Typography variant="body2" fontWeight="600">{params.row.user?.username}</Typography>
                    <Typography variant="caption" color="text.secondary">{params.row.user?.email}</Typography>
                </Box>
            )
        },
        { 
            field: 'course', 
            headerName: 'Course', 
            width: 250,
            renderCell: (params) => (
                <Typography variant="body2" noWrap title={params.row.course?.title} sx={{pt: '15px'}}>
                    {params.row.course?.title}
                </Typography>
            )
        },
        { 
            field: 'amountVND', 
            headerName: 'Amount', 
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="bold" color='#97A87A' sx={{pt: '15px'}}>
                    {formatCurrency(params.value)}
                </Typography>
            )
        },
        { 
            field: 'provider', 
            headerName: 'Provider', 
            width: 100,
            renderCell: (params) => (
                <Chip label={params.value} size="small" variant="outlined" />
            )
        },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 100,
            renderCell: (params) => {
                let color = 'default';
                let bgcolor = '#f5f5f5';
                let textColor = '#666';

                if (params.value === 'success') {
                    color = 'success';
                    bgcolor = '#e8f5e9';
                    textColor = '#2e7d32';
                } else if (params.value === 'pending') {
                    color = 'warning';
                    bgcolor = '#fff8e1';
                    textColor = '#f57f17';
                } else if (params.value === 'failed') {
                    color = 'error';
                    bgcolor = '#ffebee';
                    textColor = '#c62828';
                }

                return (
                    <Chip 
                        label={params.value?.toUpperCase()} 
                        size="small" 
                        sx={{ fontWeight: 'bold', fontSize: '0.7rem', bgcolor, color: textColor, border: 'none' }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <IconButton 
                    size="small" 
                    onClick={() => handleViewDetail(params.row.id)}
                    sx={{ color: '#97A87A', bgcolor: '#f0f4f0' }}
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            )
        }
    ];

    const CustomToolbar = () => (
        <GridToolbarContainer>
            <GridToolbarExport sx={{ color: '#97A87A' }} />
        </GridToolbarContainer>
    );

    return (
        <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'transparent', overflowY: 'auto' }}>
            
            <Box mb={4}>
                <Typography variant="h5" fontWeight="bold" color="text.primary" mb={3}>
                    Transaction Management
                </Typography>
                
                <Grid container spacing={3}>
                    <Grid item size={{xs: 12, md: 4}}>
                        <Card sx={{ bgcolor: '#1c1d1f', color: 'white', borderRadius: 2 }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold">{formatCurrency(stats?.totalRevenue || 0)}</Typography>
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>Total Revenue</Typography>
                                </Box>
                                <AttachMoneyIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item size={{xs: 12, md: 4}}>
                        <Card sx={{ bgcolor: 'white', border: '1px solid #eee', borderRadius: 2 }}>
                            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h4" fontWeight="bold" color="text.primary">{stats?.totalPayments || 0}</Typography>
                                    <Typography variant="body2" color="text.secondary">Total Transactions</Typography>
                                </Box>
                                <AccountBalanceWalletIcon sx={{ fontSize: 40, color: '#97A87A' }} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="success">Success</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Provider</InputLabel>
                    <Select
                        value={providerFilter}
                        label="Provider"
                        onChange={(e) => setProviderFilter(e.target.value)}
                    >
                        <MenuItem value="">All Providers</MenuItem>
                        <MenuItem value="VNPay">VNPay</MenuItem>
                        <MenuItem value="Momo">Momo</MenuItem>
                        <MenuItem value="Paypal">PayPal</MenuItem>
                    </Select>
                </FormControl>
                
            </Paper>

            <Paper sx={{ height: 600, width: '100%', boxShadow: 2, borderRadius: 2 }}>
                <DataGrid
                    rows={payments || []}
                    columns={columns}
                    loading={loading}
                    rowCount={pagination?.totalCount || 0}
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 20, 50]}
                    disableRowSelectionOnClick
                    slots={{ toolbar: CustomToolbar }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' },
                        '& .MuiDataGrid-columnHeaders': { bgcolor: '#f5f5f5', fontWeight: 'bold' },
                    }}
                />
            </Paper>

            <Dialog open={openDetailModal} onClose={() => setOpenDetailModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>Transaction Details</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    {loading ? (
                        <Box display="flex" justify="center" p={3}><CircularProgress /></Box>
                    ) : currentPayment ? (
                        <Box display="flex" flexDirection="column" gap={2} mt={2}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography color="text.secondary">Transaction ID:</Typography>
                                <Typography fontWeight="bold">#{currentPayment.id}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography color="text.secondary">Status:</Typography>
                                <Chip label={currentPayment.status?.toUpperCase()} size="small" 
                                    color={currentPayment.status === 'success' ? 'success' : currentPayment.status === 'failed' ? 'error' : 'warning'} />
                            </Box>
                            <Box display="flex" justifyContent="space-between">
                                <Typography color="text.secondary">Amount:</Typography>
                                <Typography variant="h6" color='#97A87A'fontWeight="bold">
                                    {formatCurrency(currentPayment.amountVND)}
                                </Typography>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Course Info</Typography>
                                <Typography variant="body1" fontWeight="500">{currentPayment.course?.title}</Typography>
                                <Typography variant="caption" color="text.secondary">Instructor: {currentPayment.course?.instructor?.username}</Typography>
                            </Box>
                            <Divider />
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Payment Info</Typography>
                                <Typography variant="body2">Provider: {currentPayment.provider}</Typography>
                                <Typography variant="body2">Date: {new Date(currentPayment.createdAt).toLocaleString('vi-VN')}</Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Typography>No details available</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDetailModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>

        </Paper>
    );
};

export default TransactionManagement;