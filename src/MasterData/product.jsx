import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Product() {
  const [formData, setFormData] = useState({
    P_id: '',
    P_name: '',
    P_price: '',
    P_unit: '',
    P_quantity: '',
    P_detail: '',
    T_id: '',
    B_id: '',
  });
  const [brands, setBrands] = useState([]);
  const [Type, setType] = useState([]);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchBrands = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/brand/get', getconfig()); 
      setBrands(res.data);
    } catch (error) {
      console.error('Fetch brands error:', error);
    }
  };

  const fetchType = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/type/get', getconfig()); 
      setType(res.data);
    } catch (error) {
      console.error('Fetch brands error:', error);
    }
  };

  const fetchNewId = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/product/getNewId', getconfig());
      setFormData(prev => ({ ...prev, P_id: res.data.P_id }));
      console.log('New ID fetched:', res.data.P_id);
    } catch (err) {
      console.error('Fetch new ID error:', err);
      Swal.fire({
        title: 'ไม่สามารถดึงรหัสอัตโนมัติได้',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/product/get', getconfig());
      setItems(res.data);
    } catch (err) {
      console.error('Fetch items error:', err);
    }
  };

  useEffect(() => {
    fetchNewId();
    fetchItems();
    fetchBrands();
    fetchType();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.P_name) {
      Swal.fire({
        title: 'กรุณากรอกชื่อสินค้า',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!formData.P_price) {
      Swal.fire({
        title: 'กรุณากรอกราคาสินค้า',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!formData.P_unit) {
      Swal.fire({
        title: 'กรุณากรอกหน่วยนับ',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!formData.P_quantity) {
      Swal.fire({
        title: 'กรุณากรอกจำนวนสินค้า',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!formData.T_id) {
      Swal.fire({
        title: 'กรุณาเลือกประเภทสินค้า',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!formData.B_id) {
      Swal.fire({
        title: 'กรุณาเลือกยี่ห้อสินค้า',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!formData.P_detail) {
      Swal.fire({
        title: 'กรุณากรอกรายละเอียดสินค้า',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
    await axios.post('http://localhost:3000/api/product/insert', {
      P_id: formData.P_id,
      P_name: formData.P_name,
      P_price: formData.P_price,
      P_unit: formData.P_unit,
      P_quantity: formData.P_quantity,
      P_detail: formData.P_detail,
      T_id: formData.T_id,
      B_id: formData.B_id,
    }, getconfig());

      Swal.fire({
        title: 'บันทึกข้อมูลสำเร็จ',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      setFormData(prev => ({ ...prev, P_name: '' , P_price: '', P_unit: '', P_quantity: '', P_detail: '', T_id: '', B_id: '' }));
      setCurrentPage(1);  
      fetchNewId();
      fetchItems();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.message || 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: `ลบสินค้า ${id} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/product/delete/${id}`, getconfig());
          Swal.fire('ลบสำเร็จ', '', 'success');
          fetchItems();
          fetchNewId();
          setCurrentPage(1);  // reset page if needed
        } catch (err) {
          console.error(err);
          Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
        }
      }
    });
  };


const handleEdit = async (item) => {
  const typeOptions = Type.map(t => `<option value="${t.T_id}" ${t.T_id === item.T_id ? 'selected' : ''}>${t.T_name}</option>`).join('');
  const brandOptions = brands.map(b => `<option value="${b.B_id}" ${b.B_id === item.B_id ? 'selected' : ''}>${b.B_name}</option>`).join('');

  const { value: formValues } = await Swal.fire({
    title: `แก้ไขข้อมูลสินค้า (${item.P_id})`,
    html: `
      <input id="swal-input1" class="form-control mb-2" placeholder="ชื่อสินค้า" value="${item.P_name}">
      <input id="swal-input2" class="form-control mb-2" placeholder="ราคา" type="number" value="${item.P_price}">
      <input id="swal-input3" class="form-control mb-2" placeholder="หน่วยนับ" value="${item.P_unit}">
      <input id="swal-input4" class="form-control mb-2" placeholder="จำนวน" type="number" value="${item.P_quantity}">
      <input id="swal-input5" class="form-control mb-2" placeholder="รายละเอียด" value="${item.P_detail}">
      <label for="swal-type" class="form-label mt-2">ประเภท</label>
      <select id="swal-type" class="form-control mb-2">${typeOptions}</select>
      <label for="swal-brand" class="form-label mt-2">ยี่ห้อ</label>
      <select id="swal-brand" class="form-control mb-2">${brandOptions}</select>
    `,
    focusConfirm: false,
    preConfirm: () => {
      return {
        P_name: document.getElementById('swal-input1').value,
        P_price: document.getElementById('swal-input2').value,
        P_unit: document.getElementById('swal-input3').value,
        P_quantity: document.getElementById('swal-input4').value,
        P_detail: document.getElementById('swal-input5').value,
        T_id: document.getElementById('swal-type').value,
        B_id: document.getElementById('swal-brand').value
      };
    }
  });

  if (formValues) {
    try {
      await axios.put(`http://localhost:3000/api/product/update/${item.P_id}`, formValues, getconfig());
      Swal.fire('แก้ไขสำเร็จ', '', 'success');
      fetchItems();
    } catch (err) {
      console.error(err);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถแก้ไขข้อมูลได้', 'error');
    }
  }
};

  // กรองข้อมูลก่อนแบ่งหน้า
  const filteredItems = items.filter((item) =>
    item.P_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.P_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // คำนวณข้อมูลที่จะแสดงในหน้านี้
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  // จำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // ฟังก์ชันเปลี่ยนหน้า
  const goToPage = (pageNumber) => {
    if (pageNumber < 1) pageNumber = 1;
    else if (pageNumber > totalPages) pageNumber = totalPages;
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container-fluid">
      <h4 className="mb-4">จัดการข้อมูลสินค้า</h4>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">รหัสสินค้า</label>
            <input
              type="text"
              name="P_id"
              value={formData.P_id}
              placeholder="รหัสสินค้า"
              className="form-control"
              readOnly
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">ชื่อสินค้า</label>
            <input
              type="text"
              name="P_name"
              value={formData.P_name}
              onChange={handleChange}
              placeholder="ชื่อสินค้า"
              className="form-control"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">ราคาสินค้า</label>
            <input
              type="text"
              name="P_price"
              value={formData.P_price}
              onChange={handleChange}
              placeholder="ราคาสินค้า"
              className="form-control"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">หน่วยนับ</label>
            <input
              type="text"
              name="P_unit"
              value={formData.P_unit}
              onChange={handleChange}
              placeholder="หน่วยนับ"
              className="form-control"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <label className="form-label">จำนวนสินค้า</label>
            <input
              type="text"
              name="P_quantity"
              value={formData.P_quantity}
              onChange={handleChange}
              placeholder="จำนวนสินค้า"
              className="form-control"
            />
          </div>

            <div className="col-md-4">
              <label className="form-label">ประเภทสินค้า</label>
              <select
                name="T_id"
                value={formData.T_id}
                onChange={(e) => {
                  const selectedType = Type.find(T => T.T_id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    T_id: e.target.value,
                    T_name: selectedType ? selectedType.T_name : '',
                  }));
                }}
                className="form-control"
              >
                <option value="">-- กรุณาเลือกยี่ห้อสินค้า --</option>
                {Type.map((Type) => (
                  <option key={Type.B_id} value={Type.T_id}>
                    {Type.T_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">ยี่ห้อสินค้า</label>
              <select
                name="B_id"
                value={formData.B_id}
                onChange={(e) => {
                  const selectedBrand = brands.find(b => b.B_id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    B_id: e.target.value,
                    B_name: selectedBrand ? selectedBrand.B_name : '',
                  }));
                }}
                className="form-control"
              >
                <option value="">-- กรุณาเลือกยี่ห้อสินค้า --</option>
                {brands.map((brand) => (
                  <option key={brand.B_id} value={brand.B_id}>
                    {brand.B_name}
                  </option>
                ))}
              </select>
            </div>
        </div>
           <div className="row mb-3">
          <div className="col-md-12">
            <label className="form-label">รายละเอียด</label>
            <textarea
              type="text"
              name="P_detail"
              value={formData.P_detail}
              onChange={handleChange}
              placeholder="รายละเอียด"
              className="form-control"
              style={{ height: '100px' }}
            />
          </div>
          </div>
        <button type="submit" className="btn btn-primary">บันทึก</button>
      </form>

      <hr className="my-4" />

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">ค้นหาสินค้า</label>
          <input
            type="text"
            placeholder="ค้นหารหัสหรือชื่อสินค้า"
            className="form-control"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // reset page เมื่อค้นหาใหม่
            }}
          />
        </div>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>รหัสสินค้า</th>
            <th>ชื่อสินค้า</th>
            <th>ราคา</th>
            <th>หน่วยนับ</th>
            <th>จำนวนสินค้า</th>
            <th>ประเภทสินค้า</th>
            <th>ยี่ห้อสินค้า</th>
            <th>รายละเอียด</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={index}>
                <td>{item.P_id}</td>
                <td>{item.P_name}</td>
                <td>{item.P_price}</td>
                <td>{item.P_unit}</td>
                <td>{item.P_quantity}</td>
                <td>{item.T_name}</td>
                <td>{item.B_name}</td>
                <td>{item.P_detail}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(item)}
                  >
                    แก้ไข
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item.P_id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center text-muted">
                ไม่พบข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      <nav>
        <ul className="pagination justify-content-end">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => goToPage(currentPage - 1)}>
              ก่อนหน้า
            </button>
          </li>
          <li className="page-item disabled">
            <span className="page-link">
              หน้า {currentPage} / {totalPages || 1}
            </span>
          </li>
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={() => goToPage(currentPage + 1)}>
              ถัดไป
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Product;
