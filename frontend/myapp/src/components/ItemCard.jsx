import React from 'react';
import { Card, CardContent, Typography, Chip, Box, Grid, Divider } from '@mui/material';
import {
  Category as CategoryIcon,
  LocationOn as LocationOnIcon,
  Event as EventIcon,
  VpnKey as VpnKeyIcon,
  CheckCircle as CheckCircleIcon,
  Help as HelpIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const StatusChip = ({ status }) => {
  let color = 'default';
  let icon = <HelpIcon />;

  if (status === 'claimed') {
    color = 'success';
    icon = <CheckCircleIcon />;
  } else if (status === 'unclaimed') {
    color = 'warning';
    icon = <ErrorIcon />;
  }

  return <Chip icon={icon} label={status} color={color} size="small" />;
};

export default function ItemCard({ item, type = 'lost' }) {
  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {item.description}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CategoryIcon color="action" />
              <Typography variant="body2">{item.category}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="action" />
              <Typography variant="body2">{type === 'lost' ? 'Last seen at' : 'Found at'} {item.location}</Typography>
            </Box>
          </Grid>
          {type === 'lost' && item.date_lost && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon color="action" />
                <Typography variant="body2">Lost on {new Date(item.date_lost).toLocaleDateString()}</Typography>
              </Box>
            </Grid>
          )}
          {item.passkey && (
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VpnKeyIcon color="action" />
                <Typography variant="body2">Passkey: {item.passkey}</Typography>
              </Box>
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
             <StatusChip status={item.status} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}