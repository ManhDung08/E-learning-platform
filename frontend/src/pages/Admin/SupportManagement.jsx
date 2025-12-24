import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllTicketsAction, updateTicketStatusAction } from '../../Redux/SupportTicket/supportTicket.action';

import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { Box, Typography, Chip, IconButton, Snackbar, Alert, Paper, Stack, Avatar } from '@mui/material';

import VisibilityIcon from '@mui/icons-material/Visibility';
import TicketDetailModal from '../../components/ticket/TicketDetailModal';

const TicketManagement = () => {
    const dispatch = useDispatch();
    const { tickets, meta, loading, success, error } = useSelector(store => store.supportTicket);

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState(null);

    const customThemeColor = '#97A87A';

    useEffect(() => {
        dispatch(getAllTicketsAction(paginationModel.page + 1, paginationModel.pageSize));
    }, [dispatch, paginationModel]);

    useEffect(() => {
        if (success || error) {
            setOpenSnackbar(true);
        }
    }, [success, error]);

    const handleOpenDetail = (id) => {
        setSelectedTicketId(id);
        setOpenModal(true);
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return { bgcolor: '#ffebee', color: '#c62828' };
            case 'in_progress': return { bgcolor: '#fff3e0', color: '#ef6c00' };
            case 'resolved': return { bgcolor: '#e8f5e9', color: '#2e7d32' };
            case 'closed': return { bgcolor: '#f5f5f5', color: '#757575' };
            default: return { bgcolor: '#e3f2fd', color: '#1976d2' };
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 50 },
        {
            field: 'userId',
            headerName: 'Sender ID',
            width: 120,
            renderCell: (params) => (
                <Chip 
                    label={`User #${params.value}`} 
                    variant="outlined" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                />
            )
        },
        {
            field: 'subject',
            headerName: 'Subject',
            flex: 1,
            minWidth: 250,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 500, pt: '25px' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'createdAt',
            headerName: 'Date Created',
            width: 180,
            renderCell: (params) => (
                <Typography variant="body2" sx={{pt: '25px'}}>
                    {new Date(params.value).toLocaleString('vi-VN')}
                </Typography>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 140,
            renderCell: (params) => {
                const styles = getStatusStyles(params.value);
                return (
                    <Chip 
                        label={params.value?.toUpperCase()} 
                        size="small" 
                        sx={{
                            ...styles,
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            minWidth: '90px'
                        }}
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
                    sx={{ 
                        color: customThemeColor, 
                        bgcolor: '#f1f8e9', 
                        '&:hover': { bgcolor: '#e1eddb' } 
                    }} 
                    onClick={() => handleOpenDetail(params.row.id)}
                >
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            )
        }
    ];

    const CustomToolbar = () => (
        <GridToolbarContainer>
            <GridToolbarExport sx={{ color: customThemeColor }} />
        </GridToolbarContainer>
    );

    return (
        <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'transparent' }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    Support Ticket Management
                </Typography>
            </Box>

            {/* DataGrid */}
            <Paper sx={{ height: 650, width: '100%', boxShadow: 2, borderRadius: 2 }}>
                <DataGrid
                    rows={Array.isArray(tickets) ? tickets : (tickets?.items || [])} 
                    columns={columns}
                    loading={loading}
                    rowHeight={70}
                    rowCount={meta?.total || tickets?.meta?.total || 0} 
                    paginationMode="server"
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 20, 50]}
                    disableRowSelectionOnClick
                    slots={{ toolbar: CustomToolbar }}
                    sx={{ 
                        border: 'none', 
                        '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' }, 
                        '& .MuiDataGrid-columnHeaders': { bgcolor: '#f5f5f5', fontWeight: 'bold' } 
                    }}
                />
            </Paper>

            <TicketDetailModal 
                open={openModal} 
                handleClose={() => setOpenModal(false)} 
                ticketId={selectedTicketId}
                customColor={customThemeColor}
            />

            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={4000} 
                onClose={() => setOpenSnackbar(false)} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    severity={error ? "error" : "success"} 
                    variant="filled" 
                    onClose={() => setOpenSnackbar(false)} 
                    sx={{ backgroundColor: error ? '#d32f2f' : customThemeColor }}
                >
                    {error || "Cập nhật trạng thái thành công!"}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default TicketManagement;