import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';

export default function ItemCard({ item, type = "lost" }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {item.description}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={item.category} color="primary" variant="outlined" />
          <Chip label={item.location} color="secondary" variant="outlined" />
          <Chip 
            label={item.status} 
            color={
              item.status === "pending" ? "warning" : 
              item.status === "found" ? "success" : 
              "default"
            } 
          />
          {item.passkey && (
            <Chip 
              label={`Passkey: ${item.passkey}`}
              color="info"
              variant="outlined"
            />
          )}
        </Box>
        {type === "lost" && item.date_lost && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Date Lost: {new Date(item.date_lost).toLocaleDateString()}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}