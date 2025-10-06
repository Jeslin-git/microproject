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
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { adminService } from '../services/api';
import Hero from './Hero';

export default function AdminDashboard() {
  const [tab, setTab] = useState(0);
  const [claims, setClaims] = useState([]);
  const [retrievals, setRetrievals] = useState([]);
  const [users, setUsers] = useState([]);
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [retrievalDialog, setRetrievalDialog] = useState({ open: false, claimId: null });
  const [retrievalNotes, setRetrievalNotes] = useState('');
  const [retrievalLocation, setRetrievalLocation] = useState('Main Office');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: null, id: null, name: null });

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 0) {
        const data = await adminService.getClaims();
        setClaims(data);
      } else if (tab === 1) {
        const data = await adminService.getRetrievals();
        setRetrievals(data);
      } else if (tab === 2) {
        const data = await adminService.getUsers();
        setUsers(data);
      } else if (tab === 3) {
        const [lost, found] = await Promise.all([
          adminService.getLostItems(),
          adminService.getFoundItems()
        ]);
        setLostItems(lost);
        setFoundItems(found);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data. Please try again.');
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
    setRetrievalLocation('Main Office');
  };

  const handleCloseRetrievalDialog = () => {
    setRetrievalDialog({ open: false, claimId: null });
    setRetrievalNotes('');
    setRetrievalLocation('Main Office');
  };

  const handleRecordRetrieval = async () => {
    try {
      await adminService.createRetrieval(retrievalDialog.claimId, retrievalLocation, retrievalNotes);
      handleCloseRetrievalDialog();
      setSuccess('Retrieval recorded successfully!');
      loadData();
    } catch (error) {
      console.error('Failed to record retrieval:', error);
      setError('Failed to record retrieval. Please try again.');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      setSuccess('User role updated successfully!');
      loadData();
    } catch (error) {
      console.error('Failed to update user role:', error);
      setError('Failed to update user role. Please try again.');
    }
  };

  const handleOpenDeleteDialog = (type, id, name) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, type: null, id: null, name: null });
  };

  const handleDelete = async () => {
    try {
      const { type, id } = deleteDialog;
      if (type === 'user') {
        await adminService.deleteUser(id);
        setSuccess('User deleted successfully!');
      } else if (type === 'lost') {
        await adminService.deleteLostItem(id);
        setSuccess('Lost item deleted successfully!');
      } else if (type === 'found') {
        await adminService.deleteFoundItem(id);
        setSuccess('Found item deleted successfully!');
      }
      handleCloseDeleteDialog();
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
      setError('Failed to delete. Please try again.');
      handleCloseDeleteDialog();
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
      <Hero 
        title="Admin Dashboard"
        subtitle="Manage claims and view retrieval history from here."
      />
      
      <Paper sx={{ p: 3 }}>
        <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
          <Tab label="Claims Management" />
          <Tab label="Retrieval History" />
          <Tab label="User Management" />
          <Tab label="Item Management" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
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
                {claims.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info">There are no pending claims to review.</Alert>
                  </Grid>
                ) : (
                  claims.map((claim) => (
                    <Grid item xs={12} sm={6} md={4} key={claim.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Claim #{claim.id.slice(-6)}</Typography>
                            <Chip 
                              label={claim.status} 
                              size="small" 
                              color={getStatusColor(claim.status)}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Student:</strong> {claim.student_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Lost Item:</strong> {claim.lost_item_title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Found Item:</strong> {claim.found_item_title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Category:</strong> {claim.lost_item_category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Claimed: {new Date(claim.created_at).toLocaleDateString()}
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
                              color="info" 
                              size="small" 
                              fullWidth
                              startIcon={<InventoryIcon />} 
                              onClick={() => handleOpenRetrievalDialog(claim.id)} 
                              sx={{ mt: 2 }}
                            >
                              Record Retrieval
                            </Button>
                          )}

                          {claim.status === 'retrieved' && (
                            <Chip 
                              label="Item Retrieved" 
                              color="success" 
                              sx={{ mt: 2 }}
                              icon={<CheckIcon />}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            )}

            {tab === 1 && (
              <Grid container spacing={3}>
                {retrievals.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info">No items have been retrieved yet.</Alert>
                  </Grid>
                ) : (
                  retrievals.map((retrieval) => (
                    <Grid item xs={12} sm={6} md={4} key={retrieval.id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Retrieval #{retrieval.id.slice(-6)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Item:</strong> {retrieval.item_title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Category:</strong> {retrieval.item_category}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Student:</strong> {retrieval.student_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Email:</strong> {retrieval.student_email}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Verified by:</strong> {retrieval.admin_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Location:</strong> {retrieval.retrieval_location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
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

            {tab === 2 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Role</strong></TableCell>
                      <TableCell><strong>Joined</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Alert severity="info">No users found.</Alert>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={user.role}
                                onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                              >
                                <MenuItem value="student">Student</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell>
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleOpenDeleteDialog('user', user.id, user.name)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom sx={{ mt: 2, mb: 2 }}>
                  Lost Items
                </Typography>
                <TableContainer component={Paper} sx={{ mb: 4 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Location</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Reported By</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lostItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Alert severity="info">No lost items found.</Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        lostItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>
                              <Chip label={item.status} size="small" color={getStatusColor(item.status)} />
                            </TableCell>
                            <TableCell>{item.student_name}</TableCell>
                            <TableCell>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleOpenDeleteDialog('lost', item.id, item.title)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                  Found Items
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Title</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell><strong>Location</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Found By</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {foundItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Alert severity="info">No found items.</Alert>
                          </TableCell>
                        </TableRow>
                      ) : (
                        foundItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.location}</TableCell>
                            <TableCell>
                              <Chip label={item.status} size="small" color={getStatusColor(item.status)} />
                            </TableCell>
                            <TableCell>{item.finder_name}</TableCell>
                            <TableCell>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleOpenDeleteDialog('found', item.id, item.title)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}

        {/* Retrieval Dialog */}
        <Dialog open={retrievalDialog.open} onClose={handleCloseRetrievalDialog} fullWidth maxWidth="sm">
          <DialogTitle>Record Item Retrieval</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                margin="dense"
                label="Retrieval Location"
                type="text"
                fullWidth
                value={retrievalLocation}
                onChange={(e) => setRetrievalLocation(e.target.value)}
                placeholder="e.g., Main Office, Security Desk"
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Notes (Optional)"
                type="text"
                fullWidth
                multiline
                rows={4}
                value={retrievalNotes}
                onChange={(e) => setRetrievalNotes(e.target.value)}
                placeholder="Enter any notes about the retrieval process..."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={handleCloseRetrievalDialog}>Cancel</Button>
            <Button 
              onClick={handleRecordRetrieval} 
              variant="contained" 
              color="primary"
              disabled={!retrievalLocation.trim()}
            >
              Confirm Retrieval
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {deleteDialog.type === 'user' ? 'user' : 'item'} "{deleteDialog.name}"?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}

