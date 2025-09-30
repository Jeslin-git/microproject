import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { itemsService } from '../services/api';

function SearchFoundItems() {
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
      <Typography variant="h4" gutterBottom>
        Search Found Items
      </Typography>
      
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={9}>
            <TextField
              fullWidth
              label="Search by keywords"
              placeholder="e.g., blue backpack, laptop, keys"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              type="submit"
              startIcon={<SearchIcon />}
              disabled={loading || !query.trim()}
              sx={{ height: '56px' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && searched && (
        <Box>
          <Typography variant="h6" gutterBottom>
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </Typography>
          
          <Grid container spacing={2}>
            {results.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      <Chip label={item.category} size="small" color="primary" />
                      <Chip label={item.location} size="small" />
                      <Chip label={item.status} size="small" color="secondary" />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Passkey: {item.passkey}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {results.length === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              No items found matching your search. Try different keywords.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

export default SearchFoundItems;
