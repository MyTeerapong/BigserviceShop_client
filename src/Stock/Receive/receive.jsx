import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Receive() {
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

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
    const handleEdit = (item) => {
    navigate(`/editReceive/${item.R_id}`);

  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/receive/get' , getconfig());
      setItems(res.data);
    } catch (err) {
      console.error('Fetch items error:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = (id) => {
    Swal.fire({
      title: `ลบข้อมูลการรับสินค้า ${id} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/receive/delete/${id}` , getconfig());
          Swal.fire('ลบสำเร็จ', '', 'success');
          fetchItems();
          setCurrentPage(1); 
        } catch (err) {
          console.error(err);
          Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถลบข้อมูลได้', 'error');
        }
      }
    });
  };

  // กรองข้อมูลก่อนแบ่งหน้า
const filteredItems = items.filter((item) =>
  item.D_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.R_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.Em_id.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className='d-flex justify-content-between mb-4'>
        <div>
            <h4 className="mb-4">จัดการข้อมูลการรับสินค้า</h4>
        </div>
        <div>
          <Link to="/insertReceive" className="btn btn-primary">+ เพิ่มรายการรับสินค้า</Link>
        </div>

      </div>
      <hr className="my-4" />

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">ค้นหารายการรับสินค้า</label>
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
            <th>รหัสการรับสินค้า</th>
            <th>วันที่รับสินค้า</th>
            <th>รหัสตัวแทนจำหน่าย</th>
            <th>รหัสพนักงาน</th>
            <th>จัดการ</th>
        </tr>
        </thead>
        <tbody>
        {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
            <tr key={index}>
                <td>{item.R_id}</td>
                <td>{item.R_date ? new Date(item.R_date).toLocaleDateString("th-TH") : "-"}</td>
                <td>{item.D_name}</td>
                <td>{item.Em_name}</td>
                <td>
                <button
                    className="btn btn-sm btn-warning me-2"
                     onClick={() => handleEdit(item)}
                >
                    แก้ไข
                </button>
                <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item.R_id)}
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

export default Receive;
