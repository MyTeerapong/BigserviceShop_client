import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import dateFormat from '../../../component/formatdate';

const EditReceive = () => {
                useEffect(() => {
                  const token = localStorage.getItem('token');
                  if (!token) {
                    navigate('/login');
                  }
                }, []);
              
            
                const getconfig = () => {
                const token = localStorage.getItem('token');
                return {
                  headers: { Authorization: `Bearer ${token}` },
                };
              };
  const { R_id } = useParams();
  const navigate = useNavigate();

  const [details, setDetails] = useState([]);
  const [formData, setFormData] = useState({
    R_id: '',
    R_date: '',
    D_id: '',
    Em_id: '',
  });
  const [loading, setLoading] = useState(true);

  const [dealer, setDealer] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [product, setProduct] = useState([]);

const fetchData = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/receive/getById/${R_id}` , getconfig());
    const receive_detail = res.data.receive_Detail;
    const receive = res.data.receive[0];
    setFormData({
      R_id: receive.R_id,
      R_date: dateFormat(receive.R_date),
      D_id: receive.D_id,
      Em_id: receive.Em_id,
    });
    setDetails(receive_detail);
    setLoading(false); 
  } catch (error) {
    console.error('Error fetching data:', error);
    Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
  }
};


  useEffect(() => {
    fetchData();
    fetchDealer();
    fetchEmployee();
    fetchProduct();
  }, []);

  const fetchDealer = async () => {
    const res = await axios.get('http://localhost:3000/api/dealer/get' , getconfig());
    setDealer(res.data);
  };

  const fetchEmployee = async () => {
    const res = await axios.get('http://localhost:3000/api/employee/get' , getconfig());
    setEmployee(res.data);
  };

  const fetchProduct = async () => {
    const res = await axios.get('http://localhost:3000/api/product/get' , getconfig());
    setProduct(res.data);
  };

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
    setDetails([...details, { P_id: '', RD_quantity: 0, RD_priceunit: 0, RD_unit: '' }]);
  };

  const removeRow = (index) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (details.length === 0 || details.some(d => !d.P_id || d.RD_quantity <= 0)) {
      Swal.fire('กรุณากรอกข้อมูลรายการสินค้าให้ครบถ้วน', '', 'warning');
      return;
    }

    if (!formData.R_date || !formData.D_id || !formData.Em_id) {
      Swal.fire('กรุณากรอกข้อมูลการรับสินค้าให้ครบถ้วน', '', 'warning');
      return;
    }

    const payload = {
      receive: formData,
      receive_detail: details
    };

    try {
      await axios.put(`http://localhost:3000/api/receive/update/${R_id}`, payload , getconfig());

      Swal.fire('แก้ไขสำเร็จ', 'ระบบได้บันทึกการแก้ไขแล้ว', 'success').then(() => {
        navigate('/receive');
      });
    } catch (error) {
      console.error('Update error:', error);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกการแก้ไขได้', 'error');
    }
  };

    if (loading) {
    return <div className="container mt-4">กำลังโหลดข้อมูล...</div>;
  }

  return (
    
    <div className="container-fuid mt-2">
      <h2>แก้ไขรายการรับสินค้า</h2>
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
                    {product.map((p) => (
                        <option key={p.P_id} value={p.P_id}>
                        {p.P_name}
                        </option>
                    ))}
                    </select>
                </td>
                <td>
                    <input
                    type="number"
                    className="form-control"
                    value={detail.RD_quantity}
                    onChange={(e) => handleDetailChange(index, 'RD_quantity', parseInt(e.target.value))}
                    />
                </td>
                <td>
                    <input type="text" className="form-control" value={detail.RD_unit} readOnly />
                </td>
                <td>
                    <input type="number" className="form-control" value={detail.RD_priceunit} readOnly />
                </td>
                <td>
                    <button type="button" className="btn btn-danger" onClick={() => removeRow(index)}>
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
          <button type="submit" className="btn btn-primary">
            แก้ไขข้อมูล
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditReceive;
