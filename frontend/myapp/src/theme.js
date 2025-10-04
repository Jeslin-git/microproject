import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

const getTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#009688', // Teal
          },
          secondary: {
            main: '#E91E63', // Pink
          },
          error: {
            main: red.A400,
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
        }
      : {
          primary: {
            main: '#4db6ac', // Lighter Teal
          },
          secondary: {
            main: '#f06292', // Lighter Pink
          },
          background: {
            default: '#212121',
            paper: '#424242',
          },
        }),
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196F3',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backgroundColor: mode === 'light' ? '#009688' : '#424242',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 24px 0 rgba(0,0,0,0.05)',
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(66, 66, 66, 0.7)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${mode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 32px 0 rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(66, 66, 66, 0.7)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${mode === 'light' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s ease',
            '& fieldset': {
              borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
              borderWidth: '2px',
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? 'rgba(0, 150, 136, 0.5)' : 'rgba(77, 182, 172, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: mode === 'light' ? '#009688' : '#4db6ac',
              borderWidth: '2px',
            },
            '&.Mui-error fieldset': {
              borderColor: red.A400,
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 500,
            '&.Mui-focused': {
              fontWeight: 600,
            },
          },
          '& .MuiInputBase-input': {
            padding: '14px 16px',
            fontSize: '1rem',
            '&::placeholder': {
              opacity: 0.7,
              fontStyle: 'italic',
            },
          },
          '& .MuiFormHelperText-root': {
            marginLeft: 4,
            marginTop: 6,
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default getTheme;
