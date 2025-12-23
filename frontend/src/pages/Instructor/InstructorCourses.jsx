import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getInstructorCoursesAction, deleteCourseAction, clearCourseMessage, createCourseAction, updateCourseAction, getCourseByIdAction, getInstructorCourseByIdAction, } from '../../Redux/Course/course.action';

import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, 
        Typography, Chip, IconButton, Snackbar, Alert, Paper } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VideoSettingsIcon from '@mui/icons-material/VideoSettings';

import CourseFormModal from '../../components/admin/CourseFormModal';
import CourseBuilder from '../../components/admin/CourseBuilder';

const InstructorCourses = () => {

    const dispatch = useDispatch();
    const { instructorCourses, loading, pagination, success, message } = useSelector(store => store.course);

    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10
    });
    const [search, setSearch] = useState("");
    const [publishFilter, setPublishFilter] = useState("");
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const [openBuilder, setOpenBuilder] = useState(false);
    const [builderCourseId, setBuilderCourseId] = useState(null);

    const customThemeColor = '#97A87A';

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, publishFilter, paginationModel]);

    const fetchCourses = () => {
        dispatch(getInstructorCoursesAction(
            paginationModel.page + 1,
            paginationModel.pageSize,
            search,
            publishFilter
        ));
    };

    useEffect(() => {
        if (success) {
            setOpenSnackbar(true);
            setOpenModal(false);
            dispatch(clearCourseMessage());
            fetchCourses();
        }
    }, [success, message, dispatch]);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this course?")) {
            dispatch(deleteCourseAction(id));
        }
    };

    const handleEdit = (course) => {
        setSelectedCourse(course);
        setOpenModal(true);
    };

    const handleOpenCreate = () => {
        setSelectedCourse(null);
        setOpenModal(true);
    };

    const handleOpenBuilder = (id) => {
        dispatch(getInstructorCourseByIdAction(id)); 
        setBuilderCourseId(id);
        setOpenBuilder(true);
    };

    const handleFormSubmit = (data) => {
        
        dispatch(clearCourseMessage());
    
        if (selectedCourse) {
            dispatch(updateCourseAction(selectedCourse.id, data));
        } else {
            dispatch(createCourseAction(data));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 60 },
        {
            field: 'image',
            headerName: 'Thumbnail',
            width: 100,
            sortable: false,
            renderCell: (params) => (
                <Box component="img" src={params.row.image || "https://via.placeholder.com/150"}
                    alt={params.row.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1, py: 1 }} />
            )
        },
        {
            field: 'title',
            headerName: 'Course Info',
            width: 300,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <Typography variant='body2' fontWeight="bold" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                        {params.row.title}
                    </Typography>
                    <Typography variant='caption' color='textSecondary'>
                        {params.row.totalLessons || 0} lessons • {Math.round((params.row.totalDuration || 0) / 60)} mins
                    </Typography>
                </Box>
            )
        },
        { 
            field: 'priceVND', 
            headerName: 'Price', 
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" fontWeight="bold" sx={{display: 'flex', height: '100%', alignItems: 'center'}} color={params.value === 0 ? "success.main" : "text.primary"}>
                    {params.value === 0 ? "Free" : formatCurrency(params.value)}
                </Typography>
            )
        },
        { 
            field: 'isPublished', 
            headerName: 'Status', 
            width: 120,
            renderCell: (params) => {
                const isPublished = params.value;
                const label = isPublished ? "Published" : "Draft";
                const bgcolor = isPublished ? '#e8f5e9' : '#fff3e0'; 
                const color = isPublished ? '#2e7d32' : '#ef6c00';
                
                return (
                    <Chip 
                        label={label} 
                        size="small" 
                        sx={{ bgcolor, color, fontWeight: 'bold', fontSize: '0.7rem', border: 'none', minWidth: '80px' }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 160,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton color="primary" onClick={() => handleOpenBuilder(params.row.id)} title="Add Content">
                        <VideoSettingsIcon />
                    </IconButton>

                    <IconButton sx={{ color: customThemeColor }} onClick={() => handleEdit(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold" color="text.primary">
                    My Courses
                </Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    sx={{ textTransform: 'none', borderRadius: 2, backgroundColor: customThemeColor, '&:hover': { backgroundColor: customThemeColor, opacity: 0.9 }}}
                    onClick={handleOpenCreate}
                >
                    Create New Course
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    size="small" variant="outlined" placeholder="Search my courses..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: customThemeColor }} /> }}
                    sx={{ flexGrow: 1, minWidth: '200px' }}
                />
                
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel sx={{ '&.Mui-focused': { color: customThemeColor } }}>Status</InputLabel>
                    <Select
                        value={publishFilter} label="Status" onChange={(e) => setPublishFilter(e.target.value)}
                        sx={{ '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: customThemeColor } }}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="true">Published</MenuItem>
                        <MenuItem value="false">Draft</MenuItem>
                    </Select>
                </FormControl>
            </Paper>

            <Paper sx={{ height: 650, width: '100%', boxShadow: 2, borderRadius: 2 }}>
                <DataGrid
                    rows={instructorCourses || []} 
                    columns={columns} 
                    loading={loading}
                    rowHeight={80} 
                    rowCount={pagination?.totalCount || 0} 
                    paginationMode="server"
                    paginationModel={paginationModel} 
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 20, 50]} 
                    disableRowSelectionOnClick
                    slots={{ toolbar: CustomToolbar }}
                    sx={{ border: 'none', '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0' }, '& .MuiDataGrid-columnHeaders': { bgcolor: '#f5f5f5', fontWeight: 'bold' } }}
                />
            </Paper>

            <CourseFormModal 
                open={openModal} 
                handleClose={() => setOpenModal(false)} 
                handleSubmit={handleFormSubmit}
                initialData={selectedCourse}
                loading={loading}
                isAdmin={false}
            />

            <CourseBuilder 
                open={openBuilder}
                handleClose={() => setOpenBuilder(false)}
                courseId={builderCourseId}
            />

            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" variant="filled" onClose={() => setOpenSnackbar(false)} sx={{ backgroundColor: customThemeColor }}>
                    {message}
                </Alert>
            </Snackbar>
        </Paper>
    )
}

export default InstructorCourses;