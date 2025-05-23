import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import Swal from 'sweetalert2';

function Type() {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    Swal.fire({
      title: 'Success!',
      text: `ID: ${formData.id}, Name: ${formData.name}`,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        จัดการข้อมูลประเภทสินค้า
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}
      >
        <TextField
          label="รหัสประเภทสินค้า"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
          size="small"
          sx={{ width: 300 }}
        />
        <TextField
          label="ชื่อประเภทสินค้า"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          size="small"
          sx={{ width: 300 }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="small"
          sx={{ minWidth: 80 }}
        >
          บันทึก
        </Button>
      </Box>
    </Box>
  );
}

export default Type;
