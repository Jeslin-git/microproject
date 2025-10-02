import React from 'react';
import { TextField, Button, Card, CardContent, Typography, Box, MenuItem, Grid } from '@mui/material';
import Hero from './Hero';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { format } from 'date-fns';

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
  dateLost: yup.date().required('Date lost is required')
});

export default function LostItemForm({ onSubmit }) {
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      location: '',
      dateLost: format(new Date(), 'yyyy-MM-dd')
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        date_lost: values.dateLost // Convert to backend format
      });
    }
  });

  return (
    <Box>
      <Hero 
        title="Lost Something?"
        subtitle="Fill out the form below to report a lost item. We'll help you find it!"
      />
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Lost Item Details
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
                  label="Last Known Location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="dateLost"
                  name="dateLost"
                  type="date"
                  label="Date Lost"
                  value={formik.values.dateLost}
                  onChange={formik.handleChange}
                  error={formik.touched.dateLost && Boolean(formik.errors.dateLost)}
                  helperText={formik.touched.dateLost && formik.errors.dateLost}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button color="primary" variant="contained" fullWidth type="submit" sx={{ py: 1.5 }}>
                  Report Lost Item
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}