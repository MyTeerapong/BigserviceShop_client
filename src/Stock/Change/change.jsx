import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Change() {
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
    const handleSelect = (item) => {
    navigate(`/insertChange/${item.S_id}`);

  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;


  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/sale/get' , getconfig());
      setItems(res.data);
    } catch (err) {
      console.error('Fetch items error:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // กรองข้อมูลก่อนแบ่งหน้า
const filteredItems = items.filter((item) =>
  item.S_id.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h4 className="mb-4">จัดการข้อมูลการเปลี่ยนสินค้า</h4>
        </div>

      </div>
      <hr className="my-4" />

      <div className="row mb-3">
        <div className="col-md-4">
          <label className="form-label">ค้นหารายการขายสินค้า</label>
          <input
            type="text"
            placeholder="ค้นหารหัสรายการขายสินค้า"
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
            <th>รหัสการขายสินค้า</th>
            <th>วันที่ขายสินค้า</th>
            <th>ราคารวม</th>
            <th>สถานะ</th>
            <th>ชื่อลูกค้า</th>
            <th>พนักงาน</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
        {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
            <tr key={index}>
                <td>{item.S_id}</td>
                <td>{item.S_date ? new Date(item.S_date).toLocaleDateString("th-TH") : "-"}</td>
                <td>{item.S_total}</td>
                <td>{item.S_status}</td>
                <td>{item.S_customer}</td>
                <td>{item.Em_name}</td>
                <td>
                <button
                    className="btn btn-sm btn-primary me-2"
                     onClick={() => handleSelect(item)}
                >
                    เลือก
                </button>
                </td>
            </tr>
            ))
        ) : (
            <tr>
            <td colSpan="8" className="text-center text-muted">
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

export default Change;
