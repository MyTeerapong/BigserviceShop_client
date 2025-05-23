import React, { useState } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

function Brand() {
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
    Swal.fire({
      title: 'Success!',
      text: `ID: ${formData.id}, Name: ${formData.name}`,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  };

  return (
    <>
    
    </>
  );
}

export default Brand;
