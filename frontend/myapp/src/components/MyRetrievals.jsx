import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Tabs,
  Tab,
  Button,
  Collapse
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { retrievalService, itemsService } from '../services/api';
import Hero from './Hero';
import ItemMatches from './ItemMatches';

export default function MyRetrievals() {
  const [tab, setTab] = useState(0);
  const [retrievals, setRetrievals] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 0) {
        const data = await itemsService.getLostItems();
        setLostItems(data);
      } else {
        const data = await retrievalService.getMyRetrievals();
        setRetrievals(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load your items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'found': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'found': return <CheckCircleIcon />;
      case 'pending': return <PendingIcon />;
      default: return <SearchIcon />;
    }
  };

  const toggleMatches = (itemId) => {
    setSelectedItemId(selectedItemId === itemId ? null : itemId);
  };

  return (
    <Box>
      <Hero 
        title="My Items"
        subtitle="Track your lost items and view your retrieval history"
      />
      
      <Paper sx={{ p: 3 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="My Lost Items" />
          <Tab label="Retrieval History" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {tab === 0 && (
              <Grid container spacing={3}>
                {lostItems.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      You haven't reported any lost items yet.
                    </Alert>
                  </Grid>
                ) : (
                  lostItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                              {item.title}
                            </Typography>
                            <Chip 
                              icon={getStatusIcon(item.status)}
                              label={item.status} 
                              color={getStatusColor(item.status)} 
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Category:</strong> {item.category}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Description:</strong> {item.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Last Seen:</strong> {item.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Date Lost:</strong> {new Date(item.date_lost).toLocaleDateString()}
                          </Typography>
                          {item.serial_number && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              <strong>Serial Number:</strong> {item.serial_number}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Passkey:</strong> {item.passkey}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            <strong>Status:</strong> {item.status === 'found' ? 'Item has been found!' : 'Still searching...'}
                          </Typography>

                          {item.status === 'pending' && (
                            <Button
                              variant="outlined"
                              fullWidth
                              startIcon={selectedItemId === item.id ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              onClick={() => toggleMatches(item.id)}
                              sx={{ mt: 1 }}
                            >
                              {selectedItemId === item.id ? 'Hide Matches' : 'View Potential Matches'}
                            </Button>
                          )}
                        </CardContent>
                      </Card>

                      {item.status === 'pending' && (
                        <Collapse in={selectedItemId === item.id} timeout="auto" unmountOnExit>
                          <Box sx={{ mt: 2 }}>
                            <ItemMatches 
                              lostItemId={item.id} 
                              lostItemTitle={item.title}
                            />
                          </Box>
                        </Collapse>
                      )}
                    </Grid>
                  ))
                )}
              </Grid>
            )}

            {tab === 1 && (
              <Grid container spacing={3}>
                {retrievals.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info">
                      You haven't retrieved any items yet.
                    </Alert>
                  </Grid>
                ) : (
                  retrievals.map((retrieval) => (
                    <Grid item xs={12} sm={6} md={4} key={retrieval.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                              {retrieval.item_title}
                            </Typography>
                            <Chip 
                              icon={<CheckCircleIcon />}
                              label="Retrieved" 
                              color="success" 
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Category:</strong> {retrieval.item_category}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Location:</strong> {retrieval.retrieval_location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Verified by:</strong> {retrieval.admin_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            <strong>Date:</strong> {new Date(retrieval.retrieval_date).toLocaleString()}
                          </Typography>
                          
                          {retrieval.notes && (
                            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                <strong>Notes:</strong>
                              </Typography>
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                {retrieval.notes}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
