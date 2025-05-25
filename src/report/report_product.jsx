import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Product() {
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


  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/product/get', getconfig());
      setItems(res.data);
    } catch (err) {
      console.error('Fetch items error:', err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchBrands();
    fetchType();
  }, []);

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

  const handleDownloadReport = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/report/product'); 
      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'report_product.pdf';
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
        <h3>รายงานสินค้า</h3>
        <button className="btn btn-primary mb-3" onClick={handleDownloadReport}>
        ออกรายงาน PDF
      </button>
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
