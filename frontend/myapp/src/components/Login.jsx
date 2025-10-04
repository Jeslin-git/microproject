import { useState } from 'react';
import { 
  TextField, Button, Card, CardContent, Typography, Box, 
  Tabs, Tab, Alert, CircularProgress, Container 
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { authService } from '../services/api';

const loginValidationSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required')
});

const signupValidationSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required')
});

export default function Login({ onLogin }) {
  const [tab, setTab] = useState(0); // 0 = Login, 1 = Signup
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loginFormik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setError('');
      setLoading(true);
      try {
        await authService.login(values);
        onLogin(values);
      } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  });

  const signupFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: signupValidationSchema,
    onSubmit: async (values) => {
      setError('');
      setLoading(true);
      try {
        await authService.register({
          name: values.name,
          email: values.email,
          password: values.password
        });
        onLogin({ email: values.email, password: values.password });
      } catch (err) {
        setError(err.response?.data?.message || 'Signup failed. Email may already be registered.');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      bgcolor: 'background.default' 
    }}>
      <Container maxWidth="xs">
        <Card raised sx={{ 
          p: 3, 
          borderRadius: 4,
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <CardContent>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
              Lost & Found
            </Typography>
            
            <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)} centered sx={{ mb: 3 }}>
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {tab === 0 ? (
              <form onSubmit={loginFormik.handleSubmit}>
                <TextField
                  fullWidth
                  id="login-email"
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  margin="normal"
                  value={loginFormik.values.email}
                  onChange={loginFormik.handleChange}
                  error={loginFormik.touched.email && Boolean(loginFormik.errors.email)}
                  helperText={loginFormik.touched.email && loginFormik.errors.email}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  id="login-password"
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  margin="normal"
                  value={loginFormik.values.password}
                  onChange={loginFormik.handleChange}
                  error={loginFormik.touched.password && Boolean(loginFormik.errors.password)}
                  helperText={loginFormik.touched.password && loginFormik.errors.password}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={loading}
                  size="large"
                  sx={{ 
                    mt: 3, 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0, 150, 136, 0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>
              </form>
            ) : (
              <form onSubmit={signupFormik.handleSubmit}>
                <TextField
                  fullWidth
                  id="signup-name"
                  name="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  margin="normal"
                  value={signupFormik.values.name}
                  onChange={signupFormik.handleChange}
                  error={signupFormik.touched.name && Boolean(signupFormik.errors.name)}
                  helperText={signupFormik.touched.name && signupFormik.errors.name}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  id="signup-email"
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  margin="normal"
                  value={signupFormik.values.email}
                  onChange={signupFormik.handleChange}
                  error={signupFormik.touched.email && Boolean(signupFormik.errors.email)}
                  helperText={signupFormik.touched.email && signupFormik.errors.email}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  id="signup-password"
                  name="password"
                  label="Password"
                  placeholder="Choose a secure password (min 6 characters)"
                  type="password"
                  margin="normal"
                  value={signupFormik.values.password}
                  onChange={signupFormik.handleChange}
                  error={signupFormik.touched.password && Boolean(signupFormik.errors.password)}
                  helperText={signupFormik.touched.password && signupFormik.errors.password}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  id="signup-confirmPassword"
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  type="password"
                  margin="normal"
                  value={signupFormik.values.confirmPassword}
                  onChange={signupFormik.handleChange}
                  error={signupFormik.touched.confirmPassword && Boolean(signupFormik.errors.confirmPassword)}
                  helperText={signupFormik.touched.confirmPassword && signupFormik.errors.confirmPassword}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={loading}
                  size="large"
                  sx={{ 
                    mt: 3, 
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(0, 150, 136, 0.3)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(0, 150, 136, 0.4)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}