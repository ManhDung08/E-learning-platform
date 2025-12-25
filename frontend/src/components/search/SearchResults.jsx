import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { getAllCoursesAction } from '../../Redux/Course/course.action';
import CourseCard from '../courses/CourseCard';
import { 
    CircularProgress, Box, Chip, Typography, IconButton,
    Popover, Stack, FormControl, InputLabel, Select, MenuItem,
    Divider, TextField, RadioGroup, FormControlLabel, Radio, Button
} from '@mui/material';

import SearchInput from '../../components/search/SearchInput'; 
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';

const SearchResultsPage = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Lấy params từ URL
    const keyword = searchParams.get('q') || "";
    const sortBy = searchParams.get('sortBy') || "newest";
    const minPrice = searchParams.get('minPrice') || "";
    const maxPrice = searchParams.get('maxPrice') || "";
    const instructorName = searchParams.get('instructorName') || "";
    const minRating = searchParams.get('minRating') || 0;

    const { courses, loading } = useSelector(store => store.course);
    
    // State cho bộ lọc UI
    const [anchorEl, setAnchorEl] = useState(null);
    const [filterData, setFilterData] = useState({
        sortBy: sortBy, minPrice: minPrice, maxPrice: maxPrice, instructorName: instructorName, minRating: minRating
    });

    // Đồng bộ state filterData với URL
    useEffect(() => {
        setFilterData({
            sortBy: searchParams.get('sortBy') || "newest",
            minPrice: searchParams.get('minPrice') || "",
            maxPrice: searchParams.get('maxPrice') || "",
            instructorName: searchParams.get('instructorName') || "",
            minRating: searchParams.get('minRating') || 0
        });
    }, [searchParams]);

    // Gọi API tìm kiếm
    useEffect(() => {
        let sortByParam = 'createdAt';
        let sortOrderParam = 'desc';
        if (sortBy === 'price_desc') { sortByParam = 'priceVND'; sortOrderParam = 'desc'; }
        if (sortBy === 'price_asc')  { sortByParam = 'priceVND'; sortOrderParam = 'asc'; }
        
        // Gọi API (page 1, limit 100, keyword, category="", isPublished=undefined)
        dispatch(getAllCoursesAction(1, 100, keyword, "", undefined, sortByParam, sortOrderParam));
    }, [dispatch, keyword, sortBy]);

    // Lọc client-side
    const filteredCourses = useMemo(() => {
        if (!courses || !Array.isArray(courses)) return [];
        let result = [...courses];

        if (instructorName) {
            const lowerName = instructorName.toLowerCase();
            result = result.filter(c => {
                const fName = c.instructor?.firstName?.toLowerCase() || '';
                const lName = c.instructor?.lastName?.toLowerCase() || '';
                return `${fName} ${lName}`.includes(lowerName);
            });
        }
        if (minPrice) result = result.filter(c => Number(c.priceVND) >= Number(minPrice));
        if (maxPrice) result = result.filter(c => Number(c.priceVND) <= Number(maxPrice));
        if (minRating > 0) result = result.filter(c => (Number(c.averageRating) || 0) >= Number(minRating));
        
        if (sortBy === 'rating_desc') {
            result.sort((a, b) => (Number(b.averageRating) || 0) - (Number(a.averageRating) || 0));
        }
        return result;
    }, [courses, instructorName, minPrice, maxPrice, minRating, sortBy]);

    // Handlers
    const handleSearch = (newKeyword) => {
        const newParams = { ...Object.fromEntries(searchParams), q: newKeyword };
        if (!newKeyword) delete newParams.q;
        setSearchParams(newParams);
    };
    const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
    const handleFilterClose = () => setAnchorEl(null);
    const handleFilterChange = (e) => setFilterData({ ...filterData, [e.target.name]: e.target.value });
    const handleApplyFilter = () => {
        const params = { q: keyword, ...filterData };
        Object.keys(params).forEach(key => { if (!params[key] || params[key] === 0 || params[key] === '0') delete params[key]; });
        setSearchParams(params);
        handleFilterClose();
    };
    const handleResetFilter = () => {
        setFilterData({ sortBy: 'newest', minPrice: '', maxPrice: '', instructorName: '', minRating: 0 });
        if (keyword) setSearchParams({ q: keyword }); else setSearchParams({});
    };
    const handleDeleteChip = (key) => {
        const newParams = Object.fromEntries(searchParams);
        delete newParams[key];
        setSearchParams(newParams);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div className="p-4 md:p-8 bg-gray-50 flex flex-col min-h-screen">
            {/* Thanh tìm kiếm */}
            <div className='mb-6 max-w-4xl mx-auto w-full'>
                <SearchInput placeholder="Search for courses, mentors..." onSearch={handleSearch} onFilterClick={handleFilterClick} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
                {keyword ? <>Search results for: "<span className="text-[#97A87A]">{keyword}</span>"</> : "All Courses"}
            </h1>

            {/* Filter Chips */}
            <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4}}>
                {minPrice && <Chip label={`Min: ${Number(minPrice).toLocaleString()}đ`} onDelete={() => handleDeleteChip('minPrice')} />}
                {maxPrice && <Chip label={`Max: ${Number(maxPrice).toLocaleString()}đ`} onDelete={() => handleDeleteChip('maxPrice')} />}
                {instructorName && <Chip label={`Instr: ${instructorName}`} onDelete={() => handleDeleteChip('instructorName')} />}
                {minRating > 0 && <Chip label={`Rating: ${minRating}+`} onDelete={() => handleDeleteChip('minRating')} />}
            </Box>

            {/* Danh sách kết quả */}
            {loading ? (
                <div className="flex justify-center p-10"><CircularProgress size={40} sx={{color: '#97A87A'}} /></div>
            ) : (
                <>
                    <h2 className="text-lg font-semibold text-gray-600 mb-4">Found {filteredCourses.length} courses</h2>
                    
                    {filteredCourses.length > 0 ? (
                        // --- ĐÃ SỬA: grid-cols-3 thay vì 4 để thẻ to hơn ---
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map(course => (
                                <div key={course.id} className="w-full"> 
                                    <CourseCard course={course} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm">
                            <p className="text-xl font-medium">No courses match your filters.</p>
                            <p className="text-sm mt-2">Try adjusting your search criteria or removing some filters.</p>
                            <Button variant="text" onClick={handleResetFilter} sx={{mt: 2, color: '#97A87A'}}>Clear all filters</Button>
                        </div>
                    )}
                </>
            )}

            {/* Popover Bộ lọc (Giữ nguyên) */}
            <Popover
                id={id} open={open} anchorEl={anchorEl} onClose={handleFilterClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{ sx: { width: '320px', padding: '20px', borderRadius: '16px', marginTop: '8px', boxShadow: '0px 4px 20px rgba(0,0,0,0.1)' } }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" fontWeight="bold" color="#333">Search Filters</Typography>
                    <IconButton size="small" onClick={handleFilterClose}><CloseIcon fontSize="small"/></IconButton>
                </Box>
                <Stack spacing={2.5}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Sort by</InputLabel>
                        <Select name="sortBy" value={filterData.sortBy} label="Sort by" onChange={handleFilterChange}>
                            <MenuItem value="newest">Newest</MenuItem>
                            <MenuItem value="price_desc">Price: High to Low</MenuItem>
                            <MenuItem value="price_asc">Price: Low to High</MenuItem>
                            <MenuItem value="rating_desc">Highest Rated</MenuItem>
                        </Select>
                    </FormControl>
                    <Divider />
                    <Box>
                        <Typography variant="subtitle2" fontWeight="600" mb={1} color="#555">Price Range (VND)</Typography>
                        <div className='flex gap-2 items-center'>
                            <TextField name="minPrice" placeholder="Min" size="small" type="number" value={filterData.minPrice} onChange={handleFilterChange} InputProps={{ sx: { borderRadius: '8px' } }} />
                            <span className='text-gray-400'>-</span>
                            <TextField name="maxPrice" placeholder="Max" size="small" type="number" value={filterData.maxPrice} onChange={handleFilterChange} InputProps={{ sx: { borderRadius: '8px' } }} />
                        </div>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="subtitle2" fontWeight="600" mb={1} color="#555">Instructor</Typography>
                        <TextField name="instructorName" fullWidth size="small" placeholder="Enter name..." value={filterData.instructorName} onChange={handleFilterChange} InputProps={{ sx: { borderRadius: '8px' } }} />
                    </Box>
                    <Divider />
                    <Box>
                        <Typography variant="subtitle2" fontWeight="600" mb={0.5} color="#555">Rating</Typography>
                        <RadioGroup name="minRating" value={filterData.minRating} onChange={handleFilterChange}>
                            {[4.5, 4.0, 3.5].map((rate) => (<FormControlLabel key={rate} value={rate.toString()} control={<Radio size="small" sx={{color: '#97A87A', '&.Mui-checked': {color: '#97A87A'}}} />} label={<div className='flex items-center text-sm'>{rate} <StarIcon sx={{fontSize:16, color:'#faaf00', ml: 0.5}}/> & up</div>} />))}
                            <FormControlLabel value="0" control={<Radio size="small" sx={{color: '#97A87A', '&.Mui-checked': {color: '#97A87A'}}} />} label={<div className='flex items-center text-sm text-gray-500'>Any rating</div>} />
                        </RadioGroup>
                    </Box>
                    <div className='flex gap-3 mt-2 pt-2'>
                        <Button fullWidth variant="outlined" color="inherit" onClick={handleResetFilter} sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#ccc', color: '#666' }}>Clear</Button>
                        <Button fullWidth variant="contained" onClick={handleApplyFilter} sx={{ borderRadius: '8px', textTransform: 'none', backgroundColor: '#97A87A', fontWeight: '600', boxShadow: 'none', '&:hover': { backgroundColor: '#7a8a63', boxShadow: 'none' } }}>Apply</Button>
                    </div>
                </Stack>
            </Popover>
        </div>
    );
};

export default SearchResultsPage;