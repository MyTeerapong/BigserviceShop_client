import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const InsertSale = () => {
            const navigate = useNavigate();
            useEffect(() => {
              const token = localStorage.getItem('token');
              if (!token) {
                navigate('/login');
              }
            }, [navigate]);
          
        
            const getconfig = () => {
            const token = localStorage.getItem('token');
            return {
              headers: { Authorization: `Bearer ${token}` },
            };
          };

  const [details, setDetails] = useState([
    { P_id: '', SD_priceunit: '', SD_total: '', SD_quantity: '' }
  ]);

  const [formData, setFormData] = useState({
    S_id: '',
    S_date: '',
    S_total: '',
    S_status: 'ปกติ',
    S_customer: '',
    Em_id: '',
  });
  const [employee, setEmployee] = useState([]);
  const [product, setProduct] = useState([]);
  const fetchNewId = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/sale/getNewId' , getconfig());
      setFormData(prev => ({ ...prev, S_id: res.data.S_id }));
      console.log('New ID fetched:', res.data.S_id);
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


  useEffect(() => {
    fetchNewId();
    fechEmployee();
    fechProduct();
  }, []);

  useEffect(() => {
  const total = details.reduce((sum, item) => {
    return sum + parseFloat(item.SD_total || 0);
  }, 0);
  setFormData(prev => ({ ...prev, S_total: total.toFixed(2) }));
}, [details]);


  const handleFormChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

    const handleDetailChange = (index, field, value) => {
    const newDetails = [...details];

    newDetails[index][field] = value;

    if (field === 'P_id') {
    const selectedProduct = product.find(p => p.P_id === value);
    if (selectedProduct) {
        newDetails[index].SD_priceunit = selectedProduct.P_price || 0;
        newDetails[index].P_quantity = selectedProduct.P_quantity || 0; // เพิ่มตรงนี้
    } else {
        newDetails[index].SD_priceunit = '';
        newDetails[index].P_quantity = 0;
    }
    }

    if (field === 'SD_quantity') {
        const quantity = parseFloat(value) || 0;
        newDetails[index].SD_quantity = quantity;
        newDetails[index].SD_total = (newDetails[index].SD_priceunit * quantity).toFixed(2);
    }

    setDetails(newDetails);
    };

  const addRow = () => {
    setDetails([...details, { P_id: '', SD_priceunit: 0, SD_total: 0 , SD_quantity: 0 }]);
  };

  const removeRow = (index) => {
    const newDetails = details.filter((_, i) => i !== index);
    setDetails(newDetails);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

    for (let i = 0; i < details.length; i++) {
    const detail = details[i];
    if (detail.SD_quantity > detail.P_quantity) {
        await Swal.fire({
        title: 'ไม่สามารถบันทึกรายการขายได้',
        text: `สินค้าแถวที่ ${i + 1} มีจำนวนไม่เพียงพอ`,
        icon: 'warning',
        confirmButtonText: 'ตกลง'
        });
        return;
    }
    }

    if (details.length === 0 || details.some(detail => !detail.P_id || detail.SD_quantity <= 0)) {
      await Swal.fire({
        title: 'กรุณากรอกข้อมูลรายการสินค้าให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
      });
      return;
    }
    if (!formData.S_date || !formData.S_total || !formData.Em_id || !formData.S_customer) {
        await Swal.fire({
        title: 'กรุณากรอกข้อมูลการขายสินค้าให้ครบถ้วน',
        icon: 'warning',
        confirmButtonText: 'ตกลง'
        });
        return;
    }
  const payload = {
    sale: formData,
    sale_detail: details
  };

  try {
    await axios.post('http://localhost:3000/api/sale/insert', payload , getconfig());

    Swal.fire({
      title: 'บันทึกสำเร็จ!',
      text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/sale'; // redirect
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
      <h2>เพิ่มรายการขายสินค้า</h2>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">รหัสการขายสินค้า</label>
            <input
              type="text"
              className="form-control"
              value={formData.S_id}
              onChange={(e) => handleFormChange('S_id', e.target.value)}
              readOnly
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">วันที่ขายสินค้า</label>
            <input
              type="date"
              className="form-control"
              value={formData.S_date}
              onChange={(e) => handleFormChange('S_date', e.target.value)}
            />
          </div>

            <div className="col-md-3">
              <label className="form-label">ชื่อลูกค้า</label>
                <input
                type="text"
                className="form-control"
                value={formData.S_customer}
                onChange={(e) => handleFormChange('S_customer', e.target.value)}
                />
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
              <th>จำนวนคงเหลือ</th>
              <th>ราคา/หน่วย</th>
              <th>จำนวนขาย</th>
              <th>ราคารวม</th>
              <th>การจัดการ</th>
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
                    value={detail.P_quantity || 0}
                    onChange={(e) => handleDetailChange(index, 'SD_priceunit', e.target.value)}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={detail.SD_priceunit}
                    onChange={(e) => handleDetailChange(index, 'SD_priceunit', e.target.value)}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={detail.SD_quantity}
                    onChange={(e) => handleDetailChange(index, 'SD_quantity', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={detail.SD_total}
                    onChange={(e) => handleDetailChange(index, 'SD_total', e.target.value)}
                    readOnly
                  />
                </td>
                <td className="text-center">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm w-50"
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
                    <td colSpan="4" className="text-end">
                    <strong>ราคารวมทั้งหมด:</strong>
                    </td>
                    <td>
                    <input
                        type="number"
                        className="form-control"
                        value={formData.S_total}
                        readOnly
                    />
                    </td>
                </tr>
                <tr>
                    <td colSpan="5">
                    <button type="button" className="btn btn-primary w-100" onClick={addRow}>
                        + เพิ่มแถว
                    </button>
                    </td>
                </tr>
                </tfoot>
        </table>

        <div className="mt-4">
          <button type="submit" className="btn btn-success">
            บันทึกข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
};

export default InsertSale;
