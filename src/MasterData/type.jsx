import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Type() {
  const [formData, setFormData] = useState({
    T_id: '',
    T_name: '',
  });
  const navigate = useNavigate();

    useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getconfig = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  };

  const fetchNewId = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/type/getNewId');
      setFormData(prev => ({ ...prev, T_id: res.data.T_id }));
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'ไม่สามารถดึงรหัสอัตโนมัติได้', icon: 'error', confirmButtonText: 'OK' });
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/type/get', getconfig());
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

    if (!formData.T_name) {
      Swal.fire({
        title: 'กรุณากรอกชื่อประเภทสินค้า',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/type/insert', {
        T_id: formData.T_id,
        T_name: formData.T_name,
      }, getconfig());

      Swal.fire({
        title: 'บันทึกข้อมูลสำเร็จ',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      setFormData(prev => ({ ...prev, T_name: '' }));
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
      title: `ลบประเภทสินค้า ${id} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/type/delete/${id}`, getconfig());
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
    const { value: newName } = await Swal.fire({
      title: `แก้ไขชื่อประเภทสินค้า (${item.T_id})`,
      input: 'text',
      inputLabel: 'ชื่อประเภทสินค้าใหม่',
      inputValue: item.T_name,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
    });

    if (newName && newName.trim() !== '' && newName !== item.T_name) {
      try {
        await axios.put(`http://localhost:3000/api/type/update/${item.T_id}`, {
          T_name: newName,
        }, getconfig());
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
    item.T_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.T_id.toLowerCase().includes(searchTerm.toLowerCase())
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
      <h4 className="mb-4">จัดการข้อมูลประเภทสินค้า</h4>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">รหัสประเภทสินค้า</label>
            <input
              type="text"
              name="T_id"
              value={formData.T_id}
              placeholder="รหัสประเภทสินค้า"
              className="form-control"
              readOnly
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">ชื่อประเภทสินค้า</label>
            <input
              type="text"
              name="T_name"
              value={formData.T_name}
              onChange={handleChange}
              placeholder="ชื่อประเภทสินค้า"
              className="form-control"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">บันทึก</button>
      </form>

      <hr className="my-4" />

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">ค้นหาประเภทสินค้า</label>
          <input
            type="text"
            placeholder="ค้นหารหัสหรือชื่อประเภทสินค้า"
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
            <th>รหัสประเภทสินค้า</th>
            <th>ชื่อประเภทสินค้า</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <tr key={index}>
                <td>{item.T_id}</td>
                <td>{item.T_name}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(item)}
                  >
                    แก้ไข
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item.T_id)}
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-muted">
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

export default Type;
