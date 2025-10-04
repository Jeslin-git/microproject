import React from 'react';
import { TextField, Button, Card, CardContent, Typography, Box, MenuItem, Grid } from '@mui/material';
import Hero from './Hero';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { format } from 'date-fns';

const categories = [
  'Electronics',
  'Books & Notebooks',
  'Clothing & Accessories',
  'Bags & Backpacks',
  'Keys & Cards',
  'Documents & IDs',
  'Laptops & Tablets',
  'Audio Equipment',
  'Eyewear',
  'Watches & Jewelry',
  'Sports Equipment',
  'Personal Items',
  'Vehicle Items',
  'Wallets & Purses',
  'Tools & Equipment',
  'Food & Beverages',
  'Other'
];

const validationSchema = yup.object({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  category: yup.string().required('Category is required'),
  location: yup.string().required('Location is required'),
  dateLost: yup.date().required('Date lost is required'),
  serialNumber: yup.string()
});

export default function LostItemForm({ onSubmit }) {
  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      category: '',
      location: '',
      dateLost: format(new Date(), 'yyyy-MM-dd'),
      serialNumber: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await onSubmit({
          ...values,
          date_lost: values.dateLost // Convert to backend format
        });
        // Reset form after successful submission
        resetForm({
          values: {
            title: '',
            description: '',
            category: '',
            location: '',
            dateLost: format(new Date(), 'yyyy-MM-dd'),
            serialNumber: ''
          }
        });
      } catch (error) {
        console.error('Error submitting lost item:', error);
        // Don't reset form if there's an error
      }
    }
  });

  return (
    <Box>
      <Hero 
        title="Lost Something?"
        subtitle="Fill out the form below to report a lost item. We'll help you find it!"
      />
      <Card sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, color: 'primary.main', fontWeight: 700 }}>
            Lost Item Details
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="title"
                  name="title"
                  label="Item Title"
                  placeholder="e.g., Blue iPhone 13, Red Backpack, Silver Laptop"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title || "Be specific - this helps with matching"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Detailed Description"
                  placeholder="Include brand, color, size, distinctive features, what's inside, any damage..."
                  multiline
                  rows={4}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description || "More details = better chance of finding your item"}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="category"
                  name="category"
                  select
                  label="Category"
                  placeholder="Select a category for the item"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={formik.touched.category && formik.errors.category || "Choose the most appropriate category"}
                  sx={{
                    '& .MuiSelect-select': {
                      minHeight: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxHeight: 300,
                          '& .MuiMenuItem-root': {
                            fontSize: '1rem',
                            padding: '12px 16px',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 150, 136, 0.08)',
                            },
                          },
                        },
                      },
                    },
                  }}
                >
                  {categories.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Last Known Location"
                  placeholder="e.g., Library 2nd Floor, Student Center, Parking Lot B"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location || "Be as specific as possible"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="serialNumber"
                  name="serialNumber"
                  label="Serial Number / ID (Optional)"
                  placeholder="e.g., iPhone IMEI, laptop serial, student ID, model number, license plate..."
                  value={formik.values.serialNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.serialNumber && Boolean(formik.errors.serialNumber)}
                  helperText={formik.touched.serialNumber && formik.errors.serialNumber || "Any identifying numbers on your item - this greatly improves matching accuracy!"}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
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
                <Button 
                  color="primary" 
                  variant="contained" 
                  fullWidth 
                  type="submit" 
                  size="large"
                  sx={{ 
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