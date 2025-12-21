import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsersAction, deleteUserAction, clearAdminMessage, createUserAction, updateUserAction } from '../../Redux/Admin/admin.action';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, 
         Typography, Avatar, Chip, IconButton, Snackbar, Alert, Paper } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

import UserFormModal from '../../components/admin/UserFormModal';

const UserManagement = () => {
    const dispatch = useDispatch();
    
    const { users, loading, pagination, success, message } = useSelector(store => store.admin);

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const customThemeColor = '#97A87A';

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, roleFilter, paginationModel]);

    const fetchUsers = () => {
        dispatch(getAllUsersAction(
            paginationModel.page + 1,
            paginationModel.pageSize, 
            search, 
            roleFilter
        ));
    };

    useEffect(() => {
        if (success) {
            setOpenSnackbar(true);
            setOpenModal(false);
            dispatch(clearAdminMessage());
            fetchUsers();
        }
    }, [success, message, dispatch]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            dispatch(deleteUserAction(id));
        }
    };

    const handleEdit = (userData) => {
        setSelectedUser(userData);
        setOpenModal(true);
    };

    const handleOpenCreate = () => {
        setSelectedUser(null);
        setOpenModal(true);
    }

    const handleFormSubmit = (formData) => {
        if (selectedUser) {
            const userId = parseInt(selectedUser.id, 10); 
            
            const dataToUpdate = { ...formData };

            if (!dataToUpdate.password || dataToUpdate.password.trim() === "") {
                delete dataToUpdate.password;
            }

            if (dataToUpdate.email === selectedUser.email) {
                delete dataToUpdate.email;
            }

            dispatch(updateUserAction(userId, dataToUpdate)); 
        } else {
            dispatch(createUserAction(formData));
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { 
            field: 'avatar', 
            headerName: 'Avatar', 
            width: 60,
            sortable: false,
            renderCell: (params) => (
                <Avatar src={params.row.profileImageUrl} sx={{width: 35, height: 35, marginTop: 1}} alt={params.row.username}>{params.row.username?.charAt(0).toUpperCase()}</Avatar>
            )
        },
        { 
            field: 'userInfo', 
            headerName: 'User Info', 
            width: 250,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="body2" fontWeight="600" color="text.primary">
                        {params.row.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.email}
                    </Typography>
                </Box>
            )
        },
        { 
            field: 'role', 
            headerName: 'Role', 
            width: 140,
            renderCell: (params) => {
                const role = params.value?.toLowerCase();
                let color = 'default';
                let bgcolor = '#f5f5f5';
                let textColor = '#666';

                if (role === 'admin') {
                    color = 'error';
                    bgcolor = '#ffebee';
                    textColor = '#c62828';
                } else if (role === 'instructor') {
                    color = 'info';
                    bgcolor = '#e3f2fd';
                    textColor = '#1565c0';
                } else {
                    color = 'success';
                    bgcolor = '#e8f5e9';
                    textColor = '#2e7d32';
                }

                return (
                    <Chip 
                        label={params.value?.toUpperCase()} 
                        size="small" 
                        sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.7rem',
                            bgcolor: bgcolor,
                            color: textColor,
                            border: 'none'
                        }}
                    />
                );
            }
        },
        { 
            field: 'isActive', 
            headerName: 'Status', 
            width: 120,
            renderCell: (params) => (
                <Chip 
                    label={params.value ? "Active" : "Inactive"} 
                    size="small" 
                    sx={{
                        bgcolor: params.value ? '#e8f5e9' : '#ffebee',
                        color: params.value ? '#2e7d32' : '#c62828',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                        border: 'none'
                    }}
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton 
                        size="small" 
                        onClick={() => handleEdit(params.row)}
                        sx={{ color: customThemeColor, mr: 1, bgcolor: '#f0f4f0' }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton 
                        size="small" 
                        onClick={() => handleDelete(params.row.id)}
                        sx={{ color: '#d32f2f', bgcolor: '#ffebee' }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ];

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <GridToolbarExport sx={{ color: customThemeColor }} />
            </GridToolbarContainer>
        );
    };

    return (
        <>
        <Paper elevation={0} sx={{ p: 3, height: '100%', bgcolor: 'transparent' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    User Management
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    sx={{ 
                        textTransform: 'none', 
                        borderRadius: 2,
                        backgroundColor: customThemeColor,
                        '&:hover': {
                            backgroundColor: customThemeColor,
                            opacity: 0.9,
                        }
                    }}
                    onClick={handleOpenCreate}
                >
                    Create New User
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Search by name, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 1, color: customThemeColor }} />,
                    }}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: customThemeColor } }}>Role</InputLabel>
                    <Select
                        value={roleFilter}
                        label="Role"
                        onChange={(e) => setRoleFilter(e.target.value)}
                        sx={{
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: customThemeColor,
                            },
                        }}
                    >
                        <MenuItem value="">All Roles</MenuItem>
                        <MenuItem value="student">Student</MenuItem>
                        <MenuItem value="instructor">Instructor</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <Paper sx={{ height: 600, width: '100%', boxShadow: 2, borderRadius: 2 }}>
                <DataGrid
                    rows={users || []}
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

            <UserFormModal open={openModal} handleClose={() => setOpenModal(false)} handleSubmit={handleFormSubmit}
                            initialData={selectedUser} loading={loading}/>

            <Snackbar 
                open={openSnackbar} 
                autoHideDuration={4000} 
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="success" variant="filled" onClose={() => setOpenSnackbar(false)} sx={{ backgroundColor: customThemeColor }}>
                    {message}
                </Alert>
            </Snackbar>
        </Paper>
        </>
    );
};

export default UserManagement;