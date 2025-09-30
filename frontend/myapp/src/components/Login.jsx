import { useState } from 'react';
import { 
  TextField, Button, Paper, Typography, Box, 
  Tabs, Tab, Alert, CircularProgress 
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
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          Lost & Found Portal
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
              label="Email"
              margin="normal"
              value={loginFormik.values.email}
              onChange={loginFormik.handleChange}
              error={loginFormik.touched.email && Boolean(loginFormik.errors.email)}
              helperText={loginFormik.touched.email && loginFormik.errors.email}
            />
            <TextField
              fullWidth
              id="login-password"
              name="password"
              label="Password"
              type="password"
              margin="normal"
              value={loginFormik.values.password}
              onChange={loginFormik.handleChange}
              error={loginFormik.touched.password && Boolean(loginFormik.errors.password)}
              helperText={loginFormik.touched.password && loginFormik.errors.password}
            />
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>
        ) : (
          <form onSubmit={signupFormik.handleSubmit}>
            <TextField
              fullWidth
              id="signup-name"
              name="name"
              label="Full Name"
              margin="normal"
              value={signupFormik.values.name}
              onChange={signupFormik.handleChange}
              error={signupFormik.touched.name && Boolean(signupFormik.errors.name)}
              helperText={signupFormik.touched.name && signupFormik.errors.name}
            />
            <TextField
              fullWidth
              id="signup-email"
              name="email"
              label="Email"
              margin="normal"
              value={signupFormik.values.email}
              onChange={signupFormik.handleChange}
              error={signupFormik.touched.email && Boolean(signupFormik.errors.email)}
              helperText={signupFormik.touched.email && signupFormik.errors.email}
            />
            <TextField
              fullWidth
              id="signup-password"
              name="password"
              label="Password"
              type="password"
              margin="normal"
              value={signupFormik.values.password}
              onChange={signupFormik.handleChange}
              error={signupFormik.touched.password && Boolean(signupFormik.errors.password)}
              helperText={signupFormik.touched.password && signupFormik.errors.password}
            />
            <TextField
              fullWidth
              id="signup-confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              margin="normal"
              value={signupFormik.values.confirmPassword}
              onChange={signupFormik.handleChange}
              error={signupFormik.touched.confirmPassword && Boolean(signupFormik.errors.confirmPassword)}
              helperText={signupFormik.touched.confirmPassword && signupFormik.errors.confirmPassword}
            />
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
          </form>
        )}

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          {tab === 0 
            ? "Don't have an account? Click Sign Up above." 
            : "Already have an account? Click Login above."}
        </Typography>
      </Paper>
    </Box>
  );
}