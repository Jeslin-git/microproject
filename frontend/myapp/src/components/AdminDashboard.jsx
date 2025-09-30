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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';
import { adminService } from '../services/api';

function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [claims, setClaims] = useState([]);
  const [retrievals, setRetrievals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retrievalDialog, setRetrievalDialog] = useState({ open: false, claimId: null });
  const [retrievalNotes, setRetrievalNotes] = useState('');

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const data = await adminService.getClaims();
        setClaims(data);
      } else {
        const data = await adminService.getRetrievals();
        setRetrievals(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClaim = async (claimId) => {
    try {
      await adminService.approveClaim(claimId);
      loadData();
    } catch (error) {
      console.error('Failed to approve claim:', error);
    }
  };

  const handleRejectClaim = async (claimId) => {
    try {
      await adminService.rejectClaim(claimId);
      loadData();
    } catch (error) {
      console.error('Failed to reject claim:', error);
    }
  };

  const handleOpenRetrievalDialog = (claimId) => {
    setRetrievalDialog({ open: true, claimId });
    setRetrievalNotes('');
  };

  const handleCloseRetrievalDialog = () => {
    setRetrievalDialog({ open: false, claimId: null });
    setRetrievalNotes('');
  };

  const handleRecordRetrieval = async () => {
    try {
      await adminService.createRetrieval(retrievalDialog.claimId, retrievalNotes);
      handleCloseRetrievalDialog();
      loadData();
    } catch (error) {
      console.error('Failed to record retrieval:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'retrieved': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Claims Management" />
        <Tab label="Retrieval History" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tab === 0 && (
            <Grid container spacing={2}>
              {claims.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">No claims to review</Alert>
                </Grid>
              ) : (
                claims.map((claim) => (
                  <Grid item xs={12} md={6} key={claim.id}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="h6">Claim #{claim.id.slice(-6)}</Typography>
                          <Chip 
                            label={claim.status} 
                            size="small" 
                            color={getStatusColor(claim.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Student: {claim.student_id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lost Item: {claim.lost_item_id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Found Item: {claim.found_item_id}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Created: {new Date(claim.created_at).toLocaleString()}
                        </Typography>
                        
                        {claim.status === 'pending' && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<CheckIcon />}
                              onClick={() => handleApproveClaim(claim.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<CloseIcon />}
                              onClick={() => handleRejectClaim(claim.id)}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                        
                        {claim.status === 'approved' && (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            startIcon={<InventoryIcon />}
                            onClick={() => handleOpenRetrievalDialog(claim.id)}
                            sx={{ mt: 2 }}
                          >
                            Record Retrieval
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              {retrievals.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">No retrievals recorded yet</Alert>
                </Grid>
              ) : (
                retrievals.map((retrieval) => (
                  <Grid item xs={12} md={6} key={retrieval.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Retrieval #{retrieval.id.slice(-6)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Claim: {retrieval.claim_id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Retrieved by: {retrieval.retrieved_by}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Date: {new Date(retrieval.retrieved_at).toLocaleString()}
                        </Typography>
                        {retrieval.notes && (
                          <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                            Notes: {retrieval.notes}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </>
      )}

      <Dialog open={retrievalDialog.open} onClose={handleCloseRetrievalDialog}>
        <DialogTitle>Record Item Retrieval</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Notes (optional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            value={retrievalNotes}
            onChange={(e) => setRetrievalNotes(e.target.value)}
            placeholder="Add any notes about the retrieval..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRetrievalDialog}>Cancel</Button>
          <Button onClick={handleRecordRetrieval} variant="contained">
            Record Retrieval
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminDashboard;
