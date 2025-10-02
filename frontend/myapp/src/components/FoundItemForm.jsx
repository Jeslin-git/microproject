import React from 'react';
import { TextField, Button, Card, CardContent, Typography, Box, MenuItem, Grid } from '@mui/material';
import Hero from './Hero';
import { useFormik } from 'formik';
import * as yup from 'yup';

const categories = [
  'Electronics',
  'Books',
  'Clothing',
  'Accessories',
  'Documents',
  'Other'
];

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  location: yup.string().required('Location is required'),
  passkey: yup.string()
});

export default function FoundItemForm({ onSubmit }) {
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      location: '',
      passkey: ''
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    }
  });

  return (
    <Box>
      <Hero 
        title="Found an Item?"
        subtitle="Thank you for helping our community! Please provide the details of the item you found."
      />
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Found Item Details
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Item Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Detailed Description"
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="category"
                  name="category"
                  select
                  label="Category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category}
                >
                  {categories.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Location Found"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="passkey"
                  name="passkey"
                  label="Passkey (optional - create a code to help verify ownership)"
                  value={formik.values.passkey}
                  onChange={formik.handleChange}
                  error={formik.touched.passkey && Boolean(formik.errors.passkey)}
                  helperText={formik.touched.passkey && formik.errors.passkey}
                />
              </Grid>
              <Grid item xs={12}>
                <Button color="primary" variant="contained" fullWidth type="submit" sx={{ py: 1.5 }}>
                  Report Found Item
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}