import React, { useEffect, useState } from 'react';
import { 
  Card, Button, IconButton, CircularProgress, 
  Box, Popover, Typography, TextField, 
  FormControl, InputLabel, Select, MenuItem, 
  RadioGroup, FormControlLabel, Radio, Divider,
  Stack, Chip 
} from '@mui/material';

import CourseCard from '../../components/courses/CourseCard';
import SearchInput from '../../components/search/SearchInput'; 

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';

import { useNavigate, createSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCoursesAction } from '../../Redux/Course/course.action';
import { openAuthModal } from '../../Redux/Auth/auth.action';

const MiddleHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { courses = [], loading } = useSelector(store => store.course || {});
  const { isAuthenticated } = useSelector(store => store.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  
  const [filterData, setFilterData] = useState({
    sortBy: 'newest',       
    minPrice: '',           
    maxPrice: '',           
    instructorName: '',     
    minRating: 0            
  });

  // --- GỌI API MẶC ĐỊNH ---
  useEffect(() => {
    // SỬA: Truyền undefined vào vị trí isPublished (tham số thứ 5)
    // Thứ tự: (page, limit, search, category, isPublished, sortBy, sortOrder)
    dispatch(getAllCoursesAction(1, 50, "", "", undefined, "createdAt", "desc"));
  }, [dispatch]);

  const freeCourses = courses.filter(course => Number(course.priceVND) === 0);
  const proCourses = courses.filter(course => Number(course.priceVND) > 0);

  // --- HANDLERS ---
  const navigateToSearch = (keyword, filters) => {
    const params = { q: keyword, ...filters };
    Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === 0 || params[key] === '0') delete params[key];
    });
    navigate({ pathname: '/search', search: `?${createSearchParams(params)}` });
  };

  const handleSearch = (keyword) => navigateToSearch(keyword, filterData);
  const handleApplyFilter = () => { handleFilterClose(); navigateToSearch("", filterData); };
  const handleResetFilter = () => setFilterData({ sortBy: 'newest', minPrice: '', maxPrice: '', instructorName: '', minRating: 0 });
  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const handleFilterChange = (e) => setFilterData({ ...filterData, [e.target.name]: e.target.value });

  const handleJoinNow = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      dispatch(openAuthModal('login'));
    }
  };
  
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div className='flex flex-col'>
      <div className='mb-2'>
        <SearchInput placeholder="Search for courses, mentors..." onSearch={handleSearch} onFilterClick={handleFilterClick} />
        {/* Popover UI giữ nguyên */}
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
                        {[4.5, 4.0, 3.5].map((rate) => (
                            <FormControlLabel key={rate} value={rate.toString()} control={<Radio size="small" sx={{color: '#97A87A', '&.Mui-checked': {color: '#97A87A'}}} />} label={<div className='flex items-center text-sm'>{rate} <StarIcon sx={{fontSize:16, color:'#faaf00', ml: 0.5}}/> & up</div>} />
                        ))}
                        <FormControlLabel value="0" control={<Radio size="small" sx={{color: '#97A87A', '&.Mui-checked': {color: '#97A87A'}}} />} label={<div className='flex items-center text-sm text-gray-500'>Any rating</div>} />
                    </RadioGroup>
                </Box>
                <div className='flex gap-3 mt-2 pt-2'>
                    <Button fullWidth variant="outlined" color="inherit" onClick={handleResetFilter} sx={{ borderRadius: '8px', textTransform: 'none', borderColor: '#ccc', color: '#666' }}>Clear</Button>
                    <Button fullWidth variant="contained" onClick={handleApplyFilter} sx={{ borderRadius: '8px', textTransform: 'none', backgroundColor: '#97A87A', fontWeight: '600', boxShadow: 'none', '&:hover': { backgroundColor: '#7a8a63', boxShadow: 'none' } }}>Apply & Search</Button>
                </div>
            </Stack>
        </Popover>
      </div>

      {/* Banner */}
      <div className='p-4 pt-2'>
        <Card sx={{borderRadius: '15px', padding: '25px', background: 'linear-gradient(135deg, #4c6b58 0%, #97A87A 50%, #DADECD 100%)', color: 'white', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'relative'}}>
            <p style={{fontSize: '14px', fontWeight: '600', letterSpacing: '1px', marginBottom: '12px', opacity: 0.9}}>ONLINE COURSE</p>
            <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.2', maxWidth: '500px' }}>Sharpen Your Skills With Professional Online Courses</h2>
            <Button onClick={handleJoinNow} variant='contained' endIcon={<ArrowForwardIcon />} sx={{backgroundColor: '#2b3b31', color: 'white', padding: '12px 28px', borderRadius: '50px', textTransform: 'none', fontSize: '12px', fontWeight: '600', transition: 'all 0.3s ease', '&:hover': {transform: 'translateY(-2px)', backgroundColor: '#16241b'}}}>Join now</Button>
          </div>
        </Card>
      </div>

      {/* Free Courses */}
      <div className='p-4 pt-2'>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0, color: '#333'}}>Top Free Courses</h2>
        </div>
        {loading ? (
           <div className="flex justify-center p-4"><CircularProgress size={30} sx={{color: '#97A87A'}} /></div>
        ) : (
          <div style={{ overflow: 'hidden', position: 'relative'}}>
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {freeCourses.length > 0 ? freeCourses.map((course) => (
                  <div key={course.id} style={{minWidth: '280px'}}> 
                    <CourseCard course={course} />
                  </div>
              )) : <p className="text-gray-500 italic text-sm">No free courses available at the moment.</p>}
            </div>
          </div>
        )}
      </div>
        
      {/* Pro Courses */}
      <div className='p-4 pt-2'>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', margin: 0, color: '#333'}}>Top Pro Courses</h2>
        </div>
        {loading ? (
           <div className="flex justify-center p-4"><CircularProgress size={30} sx={{color: '#97A87A'}} /></div>
        ) : (
          <div style={{ overflow: 'hidden', position: 'relative'}}>
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {proCourses.length > 0 ? proCourses.map((course) => (
                  <div key={course.id} style={{minWidth: '280px'}}>
                    <CourseCard course={course} />
                  </div>
              )) : <p className="text-gray-500 italic text-sm">No pro courses available at the moment.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MiddleHome;