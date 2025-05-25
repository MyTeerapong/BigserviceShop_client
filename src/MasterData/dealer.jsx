import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dealer() {
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
  const [formData, setFormData] = useState({
    D_id: '',
    D_name: '',
    D_address: '',
    D_tel: '',
  });

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchNewId = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dealer/getNewId', getconfig());
      setFormData(prev => ({ ...prev, D_id: res.data.D_id }));
      console.log('New ID fetched:', res.data.D_id);
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
      const res = await axios.get('http://localhost:3000/api/dealer/get' ,getconfig());
      setItems(res.data);
    } catch (err) {
      console.error('Fetch items error:', err);
    }
  };

  useEffect(() => {
    fetchNewId();
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.D_name) {
      Swal.fire({
        title: 'กรุณากรอกชื่อยี่ห้อสินค้า',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!formData.D_address) {
        Swal.fire({
            title: 'กรุณากรอกที่อยู่ตัวแทนจำหน่าย',
            icon: 'warning',
            confirmButtonText: 'OK',
        });
        return;
    }
    if (!formData.D_tel) {
        Swal.fire({
            title: 'กรุณากรอกเบอร์โทรตัวแทนจำหน่าย',
            icon: 'warning',
            confirmButtonText: 'OK',
        });
        return;
    }

    try {
      await axios.post('http://localhost:3000/api/dealer/insert', {
        D_id: formData.D_id,
        D_name: formData.D_name,
        D_address: formData.D_address,
        D_tel: formData.D_tel,
      } , getconfig());

      Swal.fire({
        title: 'บันทึกข้อมูลสำเร็จ',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      setFormData(prev => ({ ...prev, D_name: '', D_address: '', D_tel: '' })); // clear form fields
      setCurrentPage(1);  // reset to first page after insert
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
      title: `ลบข้อมูลตัวแทนจำหน่าย ${id} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/dealer/delete/${id}` , getconfig());
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
  const { value: formValues } = await Swal.fire({
    title: `แก้ไขข้อมูลตัวแทนจำหน่าย (${item.D_id})`,
    html:
      `<input id="swal-input1" class="swal2-input" placeholder="ชื่อตัวแทนจำหน่าย" value="${item.D_name}">` +
      `<input id="swal-input2" class="swal2-input" placeholder="เบอร์โทร" value="${item.D_tel || ''}">` +
      `<input id="swal-input3" class="swal2-input" placeholder="ที่อยู่" value="${item.D_address || ''}">`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const name = document.getElementById('swal-input1').value;
      const tel = document.getElementById('swal-input2').value;
      const address = document.getElementById('swal-input3').value;

      if (!name.trim()) {
        Swal.showValidationMessage('กรุณากรอกชื่อตัวแทนจำหน่าย');
        return false;
      }

      return { name, tel, address };
    },
  });

  if (formValues) {
    try {
      await axios.put(`http://localhost:3000/api/dealer/update/${item.D_id}`, {
        D_name: formValues.name,
        D_tel: formValues.tel,
        D_address: formValues.address,
      } , getconfig());
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
    item.D_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.D_id.toLowerCase().includes(searchTerm.toLowerCase())
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
      <h4 className="mb-4">จัดการข้อมูลตัวแทนจำหน่าย</h4>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-4">
            <label className="form-label">รหัสตัวแทนจำหน่าย</label>
            <input
              type="text"
              name="D_id"
              value={formData.D_id}
              placeholder="รหัสตัวแทนจำหน่าย"
              className="form-control"
              readOnly
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">ชื่อตัวแทนจำหน่าย</label>
            <input
              type="text"
              name="D_name"
              value={formData.D_name}
              onChange={handleChange}
              placeholder="ชื่อตัวแทนจำหน่าย"
              className="form-control"
            />
          </div>
            <div className="col-md-4">
            <label className="form-label">เบอร์โทร</label>
            <input
              type="number"
              name="D_tel"
              value={formData.D_tel}
              onChange={handleChange}
              placeholder="เบอร์โทร"
              className="form-control"
            />
          </div>
        </div>
        <div className='row mb-3'>
            <div className='col-md-12'>
            <label className="form-label">ที่อยู่</label>
            <textarea
              name="D_address"
              value={formData.D_address}
              onChange={handleChange}
              placeholder="ที่อยู่ตัวแทนจำหน่าย"
              className="form-control"
              rows="3"
            ></textarea>
            </div>
        </div>
        <button type="submit" className="btn btn-primary">บันทึก</button>
      </form>

      <hr className="my-4" />

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">ค้นหาตัวแทนจำหน่าย</label>
          <input
            type="text"
            placeholder="ค้นหารหัสหรือชื่อตัวแทนจำหน่าย"
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
            <th>รหัสตัวแทนจำหน่าย</th>
            <th>ชื่อตัวแทนจำหน่าย</th>
            <th>เบอร์โทร</th>
            <th>ที่อยู่</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={index}>
                <td>{item.D_id}</td>
                <td>{item.D_name}</td>
                <td>{item.D_tel}</td>
                <td>{item.D_address}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(item)}
                  >
                    แก้ไข
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item.D_id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
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

export default Dealer;
