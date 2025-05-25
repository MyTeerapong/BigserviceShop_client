import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import dateFormat from '../../../component/formatdate';
import { useNavigate } from 'react-router-dom';

const InsertSale = () => {
    const navigate = useNavigate();
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
    const { S_id } = useParams();
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
  const [change, setChange] = useState({
    Ch_id: '',
    Ch_date: '',
    S_id: S_id,
    Em_id: '',
  });
  const [change_detail, setChangeDetail] = useState([{
    P_id: '',
    Chd_priceunit: '',
    Chd_quantity: '',
    Chd_detail: '',
  }]);


  const [employee, setEmployee] = useState([]);
  const [product, setProduct] = useState([]);

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

const fetchData = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/api/sale/getById/${S_id}` , getconfig());
    const sale_detail = res.data.sale_detail;
    const sale = res.data.sale[0];
    setFormData({
    S_id: sale.S_id,
    S_date: dateFormat(sale.S_date),
    S_total: sale.S_total,
    S_status: sale.S_status,
    S_customer: sale.S_customer,
    Em_id: sale.Em_id,
    });
    setDetails(sale_detail);
  } catch (error) {
    console.error('Error fetching data:', error);
    Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
  }
};

useEffect(() => {
  if (product.length > 0) {
    setDetails(prevDetails =>
      prevDetails.map(detail => {
        const selectedProduct = product.find(p => p.P_id === detail.P_id);
        return {
          ...detail,
          P_quantity: selectedProduct ? selectedProduct.P_quantity : 0,
        };
      })
    );
  }
}, [product]);


  const fetchNewId = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/change/getNewId' , getconfig());
      setChange(prev => ({ ...prev, Ch_id: res.data.Ch_id }));
      console.log('New ID fetched:', res.data.Ch_id);
    } catch (err) {
      console.error('Fetch new ID error:', err);
      Swal.fire({
        title: 'ไม่สามารถดึงรหัสอัตโนมัติได้',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  useEffect(() => {
    fetchData();
    fechEmployee();
    fechProduct();
    fetchNewId();
  }, []);

const handleDetailChange = (index, field, value) => {
  const newDetails = [...change_detail];
  if (newDetails[index]) {  // ตรวจสอบว่ามี element ตำแหน่ง index จริง
    newDetails[index][field] = value;
    setChangeDetail(newDetails);
  } else {
    console.warn(`No element at index ${index} in change_detail`);
  }
};

// ตั้งค่า change_detail เมื่อ details โหลดเสร็จ
useEffect(() => {
  if(details.length > 0) {
    setChangeDetail(details.map(detail => ({
        P_id: detail.P_id,
      Chd_priceunit: detail.SD_priceunit,
      Chd_quantity: '',
      Chd_detail: '',
    })));
  }
}, [details]);


const handleSubmit = async (e) => {
  e.preventDefault();

for (let i = 0; i < details.length; i++) {
  const detail = details[i];
  const changeItem = change_detail[i];
  
  if (!changeItem) continue; // กรณีไม่มีข้อมูล
  
  if (parseInt(changeItem.Chd_quantity) > detail.P_quantity) {
    await Swal.fire({
      title: 'ไม่สามารถบันทึกรายการขายได้',
      text: `สินค้าแถวที่ ${i + 1} มีจำนวนไม่เพียงพอ`,
      icon: 'warning',
      confirmButtonText: 'ตกลง'
    });
    return;
  }
}

  // ตรวจสอบข้อมูล change (การเปลี่ยนสินค้า)
  if (!change.Ch_date || !change.Em_id) {
    await Swal.fire({
      title: 'กรุณากรอกข้อมูลการเปลี่ยนสินค้าให้ครบถ้วน',
      icon: 'warning',
      confirmButtonText: 'ตกลง',
    });
    return;
  }

  const payload = {
    change: change,
    change_detail: change_detail,
  };

  try {
    
    await axios.post(`http://localhost:3000/api/change/insert`, payload , getconfig());

    Swal.fire({
      title: 'บันทึกสำเร็จ!',
      text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      icon: 'success',
      confirmButtonText: 'ตกลง',
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = '/change'; // redirect
      }
    });
  } catch (error) {
    console.error('update error:', error);
    Swal.fire({
      title: 'เกิดข้อผิดพลาด',
      text: 'ไม่สามารถบันทึกข้อมูลได้',
      icon: 'error',
      confirmButtonText: 'ตกลง',
    });
  }
};

  return (
    <div className="mt-2">
      <h2>เปลี่ยนสินค้า</h2>
      <form onSubmit={handleSubmit}>
        <div className="containerข-fluid mt-4">
            <div className="row mb-4">
                <div className="col-md-2">
                <div className="mb-3">
                    <label className="form-label">รหัสการรับสินค้า</label>
                    <input
                    type="text"
                    className="form-control bg-light text-dark"
                    value={formData.S_id}
                    readOnly
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">ชื่อลูกค้า</label>
                    <input
                    type="text"
                    className="form-control bg-light text-dark"
                    value={formData.S_customer}
                    readOnly
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">วันที่ขายสินค้า</label>
                    <input
                    type="date"
                    className="form-control bg-light text-dark"
                    value={formData.S_date}
                    readOnly
                    />
                </div>

                 <div className="mb-3">
                    <label className="form-label">ชื่อพนักงานขาย</label>
                    <input
                    type="text"
                    className="form-control bg-light text-dark"
                    value={employee.find((em) => em.Em_id === formData.Em_id)?.Em_name || ''}
                    readOnly
                    />
                </div>

                </div>

                <div className="col-md-6">
                <div className="mb-3">
                    <label className="form-label">รหัสการเปลี่ยนสินค้า</label>
                    <input
                    type="text"
                    className="form-control bg-light text-dark"
                    value={change.Ch_id}
                    readOnly
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">วันที่เปลี่ยน</label>
                    <input
                    type="date"
                    className="form-control"
                    value={change.Ch_date}
                    onChange={(e) => setChange(prev => ({ ...prev, Ch_date: e.target.value }))}
                    />
                </div>

                 <div className="mb-3">
                    <label className="form-label">ชื่อพนักงานเปลี่ยน</label>
                    <select
                        name="Em_id"
                        value={change.Em_id}
                        onChange={(e) => {
                        const selectedEmployee = employee.find(em => em.Em_id === e.target.value);
                        setChange(prev => ({
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
              <th>จำนวนเปลี่ยน</th>
              <th>หมายเหตุ</th>
            </tr>
          </thead>
          <tbody>
            {details.map((detail, index) => (
              <tr key={index}>
                <td>
                    <input
                    type="text"
                    className="form-control bg-light text-dark"
                    value={
                        product.find((p) => p.P_id === detail.P_id)?.P_name || ''
                    }
                    readOnly
                    />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control bg-light text-dark"
                    value={detail.P_quantity || 0}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control bg-light text-dark"
                    value={detail.SD_priceunit}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control bg-light text-dark"
                    value={detail.SD_quantity}
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    value={change_detail[index]?.Chd_quantity || ''}
                    onChange={(e) => handleDetailChange(index, 'Chd_quantity', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={change_detail[index]?.Chd_detail || ''}
                    onChange={(e) => handleDetailChange(index, 'Chd_detail', e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
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
