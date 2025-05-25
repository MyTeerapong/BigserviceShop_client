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

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/dealer/get' ,getconfig());
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

  const handleDownloadReport = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/report/dealer'); 
      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report_dealer.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดรายงาน');
      console.error(error);
    }
  };

  return (
    <div className="container-fluid">
        <h3>รายงานตัวแทนจำหน่าย</h3>
        <button className="btn btn-primary mb-3" onClick={handleDownloadReport}>
        ออกรายงาน PDF
      </button>
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
