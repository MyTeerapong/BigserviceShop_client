import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InsertReceive = () => {
  const navigate = useNavigate();
                useEffect(() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    navigate('/login');
                  }
                }, [ navigate ]);
              
            
                const getconfig = () => {
                const token = localStorage.getItem('token');
                return {
                  headers: { Authorization: `Bearer ${token}` },
                };
              };

  const [details, setDetails] = useState([
    { P_id: '', RD_quantity: 0, RD_priceunit: '', RD_unit: '' }
  ]);

  const [formData, setFormData] = useState({
    R_id: '',
    R_date: '',
    D_id: '',
    Em_id: ''
  });
  const [dealer, setDealer] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [product, setProduct] = useState([]);
  const fetchNewId = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/receive/getNewId' , getconfig());
      setFormData(prev => ({ ...prev, R_id: res.data.R_id }));
      console.log('New ID fetched:', res.data.R_id);
    } catch (err) {
      console.error('Fetch new ID error:', err);
      Swal.fire({
        title: 'ไม่สามารถดึงรหัสอัตโนมัติได้',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const fechEmployee = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/employee/get' , getconfig()); 
      setEmployee(res.data);
    } catch (error) {
      console.error('Fetch brands error:', error);
    }
  };

  const fechProduct = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/product/get' , getconfig()); 
      setProduct(res.data);
    } catch (error) {
      console.error('Fetch brands error:', error);
    }
  };

  const fecchDealer = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dealer/get' , getconfig()); 
      setDealer(res.data);
    } catch (error) {
      console.error('Fetch brands error:', error);
    }
  };

  useEffect(() => {
    fetchNewId();
    fecchDealer();
    fechEmployee();
    fechProduct();
  }, []);

  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

    const handleDetailChange = (index, field, value) => {
    const newDetails = [...details];

    newDetails[index][field] = value;

    if (field === 'P_id') {
        const selectedProduct = product.find(p => p.P_id === value);
        if (selectedProduct) {
        newDetails[index].RD_unit = selectedProduct.P_unit || '';
        newDetails[index].RD_priceunit = selectedProduct.P_price || 0;
        } else {
        newDetails[index].RD_unit = '';
        newDetails[index].RD_priceunit = 0;
        }
    }

    setDetails(newDetails);
    };

  const addRow = () => {
    setDetails([...details, { P_id: '', RD_quantity: 0, RD_priceunit: 0 , RD_unit: '' }]);
  };

  const removeRow = (index) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
    if (details.length === 0 || details.some(detail => !detail.P_id || detail.RD_quantity <= 0)) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูลรายการสินค้าให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }
    if (!formData.R_date || !formData.D_id || !formData.Em_id) {
        Swal.fire({
        title: 'กรุณากรอกข้อมูลการรับสินค้าให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
        });
        return;
    }
  const payload = {
    receive: formData,
    receive_detail: details
  };

  try {
    await axios.post('http://localhost:3000/api/receive/insert', payload , getconfig());

    Swal.fire({
      title: 'บันทึกสำเร็จ!',
      text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/receive'; // redirect
      }
    });

  } catch (error) {
    console.error('Insert error:', error);
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถบันทึกข้อมูลได้',
      icon: 'error',
      confirmButtonText: 'ตกลง'
    });
  }
};


  return (
    <div className="container-fuid mt-2">
      <h2>เพิ่มรายการรับสินค้า</h2>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">รหัสการรับสินค้า</label>
            <input
              type="text"
              className="form-control"
              value={formData.R_id}
              onChange={(e) => handleFormChange('R_id', e.target.value)}
              readOnly
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">วันที่รับสินค้า</label>
            <input
              type="date"
              className="form-control"
              value={formData.R_date}
              onChange={(e) => handleFormChange('R_date', e.target.value)}
            />
          </div>

            <div className="col-md-3">
              <label className="form-label">ชื่อตัวแทนจำหน่าย</label>
              <select
                name="B_id"
                value={formData.D_id}
                onChange={(e) => {
                  const selectedDealer = dealer.find(d => d.D_id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    D_id: e.target.value,
                    D_name: selectedDealer ? selectedDealer.D_name : '',
                  }));
                }}
                className="form-control"
              >
                <option value="">-- กรุณาเลือกตัวแทนจำหน่าย --</option>
                {dealer.map((dealer) => (
                  <option key={dealer.D_id} value={dealer.D_id}>
                    {dealer.D_name}
                  </option>
                ))}
              </select>
            </div>

          <div className="col-md-3">
              <label className="form-label">ชื่อพนักงาน</label>
              <select
                name="Em_id"
                value={formData.Em_id}
                onChange={(e) => {
                  const selectedEmployee = employee.find(em => em.Em_id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    Em_id: e.target.value,
                    Em_name: selectedEmployee ? selectedEmployee.Em_name : '',
                  }));
                }}
                className="form-control"
              >
                <option value="">-- กรุณาเลือกพนักงาน --</option>
                {employee.map((employee) => (
                  <option key={employee.Em_id} value={employee.Em_id}>
                    {employee.Em_name}
                  </option>
                ))}
              </select>
            </div>
        </div>

        <h5 className="mt-4">เพิ่มรายการสินค้า</h5>
        <table className="table table-bordered mt-2">
          <thead className="table-secondary">
            <tr>
              <th>ชื่อสินค้า</th>
              <th>จำนวนรับ</th>
              <th>หน่วยนับ</th>
              <th>ราคา/หน่วย</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {details.map((detail, index) => (
              <tr key={index}>
                <td>
                    <select
                        className="form-control"
                        value={detail.P_id}
                        onChange={(e) => handleDetailChange(index, 'P_id', e.target.value)}
                    >
                        <option value="">-- เลือกสินค้า --</option>
                        {product.map((product) => (
                        <option key={product.P_id} value={product.P_id}>
                            {product.P_name}
                        </option>
                        ))}
                    </select>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={detail.RD_quantity}
                    onChange={(e) => handleDetailChange(index, 'RD_quantity', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={detail.RD_unit}
                    onChange={(e) => handleDetailChange(index, 'RD_unit', e.target.value)}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={detail.RD_priceunit}
                    onChange={(e) => handleDetailChange(index, 'RD_priceunit', e.target.value)}
                    readOnly
                  />
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => removeRow(index)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
            <tfoot>
            <tr>
                <td colSpan="6" className="text-center">
                <button type="button" className="btn btn-primary w-100" onClick={addRow}>
                    + เพิ่มแถว
                </button>
                </td>
            </tr>
            </tfoot>
        </table>

        <div className="mt-4">
          <button type="submit" className="btn btn-success" onClick={handleSubmit}>
            บันทึกข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
};

export default InsertReceive;
