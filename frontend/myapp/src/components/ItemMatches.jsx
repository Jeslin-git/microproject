import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { itemsService } from '../services/api';

function ItemMatches({ lostItemId, lostItemTitle }) {
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
    <Box>
      <Typography variant="h5" gutterBottom>
        Potential Matches for "{lostItemTitle}"
      </Typography>
      
      {matches.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No potential matches found yet. We'll notify you when someone reports a matching item.
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Found {matches.length} potential {matches.length === 1 ? 'match' : 'matches'}
          </Typography>
          
          <Grid container spacing={2}>
            {matches.map((item) => (
              <Grid item xs={12} md={6} key={item.id}>
                <Card sx={{ border: '2px solid', borderColor: 'primary.light' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {item.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                      <Chip label={item.category} size="small" color="primary" />
                      <Chip label={item.location} size="small" />
                      <Chip label={item.status} size="small" color="secondary" />
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                      Passkey: {item.passkey}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleCreateClaim(item.id)}
                      fullWidth
                    >
                      Claim This Item
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
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
    </Box>
  );
}

export default ItemMatches;
