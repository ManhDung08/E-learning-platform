import { IconButton, InputBase, Paper } from '@mui/material'
import React, { useState } from 'react'
import FilterIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

const SearchInput = () => {

  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className='w-full flex items-center gap-4 p-4'>
      <Paper component="form" sx={{p: 1, px: 2, flex: 1, display: 'flex', alignItems: 'center', borderRadius: '15px'}}>
        <IconButton sx={{ p: '10px' }} aria-label="search" onClick={handleSearch}>
          <SearchIcon className='text-gray-400'/>
        </IconButton>
        <InputBase placeholder='Search your course or instructor here...'
                    sx={{ml: 1, flex: 1}} value={keyword} onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={handleKeyDown}/>
      </Paper>
      <IconButton sx={{p: '10px', backgroundColor: '#F4F6F8'}}
      >
        <FilterIcon />
        </IconButton>
    </div>
  )
}

export default SearchInput
