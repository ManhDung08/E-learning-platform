import { IconButton, InputBase, Paper } from '@mui/material'
import React, { useState, useEffect } from 'react'
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SearchInput = ({ onFilterClick, onSearch, placeholder }) => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Đồng bộ ô input với URL nếu đang ở trang search
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setKeyword(query);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    
    // Nếu cha có truyền onSearch (MiddleHome) -> Gọi nó để cha xử lý chuyển hướng
    if (onSearch) {
        onSearch(keyword.trim());
    } else {
        // Fallback: Tự navigate nếu không có props onSearch (dùng ở Header chẳng hạn)
        if (keyword.trim()) {
            navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
        }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  return (
    <div className='w-full flex items-center gap-4 p-4'>
      <Paper 
        component="form" 
        onSubmit={handleSearchSubmit} 
        sx={{p: 1, px: 2, flex: 1, display: 'flex', alignItems: 'center', borderRadius: '15px'}}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search" onClick={handleSearchSubmit}>
          <SearchIcon className='text-gray-400'/>
        </IconButton>
        
        <InputBase 
            placeholder={placeholder || 'Search for courses, mentors...'}
            sx={{ml: 1, flex: 1}} 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
        />
      </Paper>

      {/* Chỉ hiện nút Filter nếu được truyền function xử lý */}
      {onFilterClick && (
        <IconButton 
            sx={{p: '10px', backgroundColor: '#F4F6F8'}}
            onClick={onFilterClick} 
        >
            <FilterListIcon />
        </IconButton>
      )}
    </div>
  )
}

export default SearchInput