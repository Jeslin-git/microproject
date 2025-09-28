import React from 'react';
import { TextField, Button, Paper, Typography, Box, MenuItem } from '@mui/material';
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
    <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 600 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Report Lost Item
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          id="title"
          name="title"
          label="Item Title"
          margin="normal"
          value={formik.values.title}
          onChange={formik.handleChange}
          error={formik.touched.title && Boolean(formik.errors.title)}
          helperText={formik.touched.title && formik.errors.title}
        />
        <TextField
          fullWidth
          id="description"
          name="description"
          label="Description"
          multiline
          rows={4}
          margin="normal"
          value={formik.values.description}
          onChange={formik.handleChange}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description}
        />
        <TextField
          fullWidth
          id="category"
          name="category"
          select
          label="Category"
          margin="normal"
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
        <TextField
          fullWidth
          id="location"
          name="location"
          label="Last Seen Location"
          margin="normal"
          value={formik.values.location}
          onChange={formik.handleChange}
          error={formik.touched.location && Boolean(formik.errors.location)}
          helperText={formik.touched.location && formik.errors.location}
        />
        <TextField
          fullWidth
          id="dateLost"
          name="dateLost"
          type="date"
          label="Date Lost"
          margin="normal"
          value={formik.values.dateLost}
          onChange={formik.handleChange}
          error={formik.touched.dateLost && Boolean(formik.errors.dateLost)}
          helperText={formik.touched.dateLost && formik.errors.dateLost}
          InputLabelProps={{ shrink: true }}
        />
        <Box sx={{ mt: 2 }}>
          <Button color="primary" variant="contained" fullWidth type="submit">
            Submit Report
          </Button>
        </Box>
      </form>
    </Paper>
  );
}