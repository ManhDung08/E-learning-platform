import { IconButton, InputBase, Paper } from '@mui/material'
import React from 'react'
import FilterIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';

const SearchInput = () => {
  return (
    <div className='w-full flex items-center gap-4 p-4'>
      <Paper component="form" sx={{p: 1, px: 2, flex: 1, display: 'flex', alignItems: 'center', borderRadius: '15px'}}>
        <SearchIcon className='text-gray-400'/>
        <InputBase placeholder='Search your course here...'
                    sx={{ml: 1, flex: 1}}/>
      </Paper>
      <IconButton sx={{p: '10px', backgroundColor: '#F4F6F8'}}
      >
        <FilterIcon />
        </IconButton>
    </div>
  )
}

export default SearchInput
