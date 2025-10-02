import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { itemsService } from '../services/api';
import ItemCard from './ItemCard';

export default function ItemMatches({ lostItemId, lostItemTitle }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadMatches();
  }, [lostItemId]);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await itemsService.getMatches(lostItemId);
      setMatches(data);
    } catch (error) {
      console.error('Failed to load matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClaim = async (foundItemId) => {
    try {
      await itemsService.createClaim(lostItemId, foundItemId);
      setSnackbar({
        open: true,
        message: 'Claim created successfully!',
        severity: 'success'
      });
      // Optionally reload matches or update UI
    } catch (error) {
      console.error('Failed to create claim:', error);
      setSnackbar({
        open: true,
        message: 'Failed to create claim. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Potential Matches for "{lostItemTitle}"
      </Typography>
      
      {matches.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No potential matches found at this time. The system will continue to search for your item.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {matches.map((item) => (
            <Grid item xs={12} sm={6} key={item.id}>
              <ItemCard item={item} type="found" />
              <Button
                variant="contained"
                color="primary"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleCreateClaim(item.id)}
                fullWidth
                sx={{ mt: 1 }}
              >
                This is my item!
              </Button>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

