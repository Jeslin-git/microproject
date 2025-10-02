import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

// This is a placeholder for your SVG illustration.
// You can replace the content of this component with your own caricature SVG code.
const Illustration = ({ color }) => (
  <svg width="250" height="200" viewBox="0 0 250 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M57.5 137.5C57.5 137.5 23.1667 137.167 8.5 137.5L12.5 100C12.5 100 23.1667 87.8333 41.5 87.5C59.8333 87.1667 57.5 137.5 57.5 137.5Z" fill={color} fillOpacity="0.3"/>
    <path d="M192.5 137.5C192.5 137.5 226.833 137.167 241.5 137.5L237.5 100C237.5 100 226.833 87.8333 208.5 87.5C190.167 87.1667 192.5 137.5 192.5 137.5Z" fill={color} fillOpacity="0.3"/>
    <rect x="50" y="25" width="150" height="150" rx="15" fill={color} fillOpacity="0.1" />
    <circle cx="125" cy="100" r="40" fill={color} />
    <circle cx="125" cy="100" r="30" fill="white" />
    <path d="M112 90L138 110" stroke={color} strokeWidth="5" strokeLinecap="round"/>
    <path d="M138 90L112 110" stroke={color} strokeWidth="5" strokeLinecap="round"/>
    <rect x="70" y="130" width="110" height="20" rx="10" fill={color} fillOpacity="0.5"/>
    <Typography>Your caricature here</Typography>
  </svg>
);

const Hero = ({ title, subtitle }) => {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: { xs: 'center', md: 'left' },
        gap: 4,
        my: 4,
        p: 3,
      }}
    >
      <Box>
        <Typography variant="h3" component="h1" fontWeight="700" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight="400">
          {subtitle}
        </Typography>
      </Box>
      <Box>
        <Illustration color={primaryColor} />
      </Box>
    </Box>
  );
};

export default Hero;
