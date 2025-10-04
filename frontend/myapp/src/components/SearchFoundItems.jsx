import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { itemsService } from '../services/api';
import ItemCard from './ItemCard';
import Hero from './Hero';

export default function SearchFoundItems() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const data = await itemsService.searchFoundItems(query);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Hero 
        title="Search for Items"
        subtitle="Use the search bar below to find items that have been reported as found."
      />
      <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto', mt: 4, borderRadius: 3 }}>
        <Typography variant="h5" gutterBottom>
          Find a Found Item
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ mb: 5 }}>
          <TextField
            fullWidth
            label="Search for Found Items"
            placeholder="Try searching: 'blue backpack', 'iPhone library', 'red wallet cafeteria'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                fontSize: '1.1rem',
                '& .MuiInputBase-input': {
                  padding: '18px 16px',
                },
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading || !query.trim()}
                    startIcon={<SearchIcon />}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0, 150, 136, 0.4)',
                      }
                    }}
                  >
                    Search
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && searched && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {results.length} {results.length === 1 ? 'Result' : 'Results'}
            </Typography>
            
            <Grid container spacing={3}>
              {results.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <ItemCard item={item} type="found" />
                </Grid>
              ))}
            </Grid>

            {results.length === 0 && (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                No items found matching your search criteria.
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

