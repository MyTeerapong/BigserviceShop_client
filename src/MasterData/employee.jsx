import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function Employee() {
  const [formData, setFormData] = useState({
    Em_id: '',
    Em_name: '',
    Em_gender: '',
    Em_address: '',
    Em_tel: '',
    Em_date: '',
    Em_username	: '',
    Em_password: '',
    Em_status: '',
  });
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchNewId = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/employee/getNewId');
      setFormData(prev => ({ ...prev, Em_id: res.data.Em_id }));
      console.log('New ID fetched:', res.data.Em_id);
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
      const res = await axios.get('http://localhost:3000/api/employee/get');
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

    if (!formData.Em_name) {
      Swal.fire({
        title: 'กรุณากรอกชื่อสินค้า',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!formData.Em_status) {
      Swal.fire({
        title: 'กรุณาเลือกสถานะ',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!formData.Em_tel) {
        Swal.fire({
        title: 'กรุณากรอกเบอร์โทรศัพท์',
        icon: 'warning',
        confirmButtonText: 'OK',
        });
        return;
    }
    if (!formData.Em_date) {
        Swal.fire({
        title: 'กรุณากรอกวันที่เริ่มงาน',
        icon: 'warning',
        confirmButtonText: 'OK',
        });
        return;
    }
    if (!formData.Em_username) {
        Swal.fire({
        title: 'กรุณากรอกชื่อผู้ใช้',
        icon: 'warning',
        confirmButtonText: 'OK',
        });
        return;
    }
    if (!formData.Em_password) {
        Swal.fire({
        title: 'กรุณากรอกรหัสผ่าน',
        icon: 'warning',
        confirmButtonText: 'OK',
        });
        return;
    }
    if (!formData.Em_gender) {
        Swal.fire({
        title: 'กรุณาเลือกเพศ',
        icon: 'warning',
        confirmButtonText: 'OK',
        });
        return;
    }
    if (!formData.Em_address) {
        Swal.fire({
        title: 'กรุณากรอกที่อยู่',
        icon: 'warning',
        confirmButtonText: 'OK',
        });
        return;
    }

    try {
    await axios.post('http://localhost:3000/api/employee/insert', {
        Em_id: formData.Em_id,
        Em_name: formData.Em_name,
        Em_gender : formData.Em_gender,
        Em_address: formData.Em_address,
        Em_tel: formData.Em_tel,
        Em_date: formData.Em_date,
        Em_username: formData.Em_username,
        Em_password: formData.Em_password,
        Em_status: formData.Em_status,
    });

      Swal.fire({
        title: 'บันทึกข้อมูลสำเร็จ',
        icon: 'success',
        confirmButtonText: 'OK',
      });

      setFormData(prev => ({ ...prev, Em_name: '', Em_gender: '', Em_address: '', Em_tel: '', Em_date: '', Em_username: '', Em_password: '', Em_status: '' }));
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
      title: `ลบข้อมูลพนักงาน ${id} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:3000/api/employee/delete/${id}`);
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
      const formattedDate = item.Em_date
  ? new Date(item.Em_date).toISOString().split('T')[0]
  : '';
  const { value: formValues } = await Swal.fire({
    title: `แก้ไขข้อมูลพนักงาน (${item.Em_id})`,
    html: `
      <input id="swal-name" class="form-control mb-2" placeholder="ชื่อพนักงาน" value="${item.Em_name}">
      <select id="swal-gender" class="form-select mb-2">
        <option value="ชาย" ${item.Em_gender === 'ชาย' ? 'selected' : ''}>ชาย</option>
        <option value="หญิง" ${item.Em_gender === 'หญิง' ? 'selected' : ''}>หญิง</option>
      </select>
      <input id="swal-tel" class="form-control mb-2" placeholder="เบอร์โทร" value="${item.Em_tel}">
      <input id="swal-date" class="form-control mb-2" type="date" value="${formattedDate}">
      <select id="swal-status" class="form-select mb-2">
        <option value="ทำงาน" ${item.Em_status === 'ทำงาน' ? 'selected' : ''}>ทำงาน</option>
        <option value="ลาออก" ${item.Em_status === 'ลาออก' ? 'selected' : ''}>ลาออก</option>
      </select>
      <textarea id="swal-address" class="form-control mb-2" placeholder="ที่อยู่">${item.Em_address}</textarea>
      <input id="swal-username" class="form-control mb-2" placeholder="ชื่อผู้ใช้" value="${item.Em_username}">
      <input id="swal-password" class="form-control mb-2" placeholder="รหัสผ่าน" value="${item.Em_password}">
    `,
    focusConfirm: false,
    preConfirm: () => {
      return {
        Em_name: document.getElementById('swal-name').value,
        Em_gender: document.getElementById('swal-gender').value,
        Em_tel: document.getElementById('swal-tel').value,
        Em_date: document.getElementById('swal-date').value,
        Em_status: document.getElementById('swal-status').value,
        Em_address: document.getElementById('swal-address').value,
        Em_username: document.getElementById('swal-username').value,
        Em_password: document.getElementById('swal-password').value,
      };
    }
  });

  if (formValues) {
    try {
      await axios.put(`http://localhost:3000/api/employee/update/${item.Em_id}`, formValues);
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
    item.Em_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <h4 className="mb-4">จัดการข้อมูลพนักงาน</h4>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-3">
            <label className="form-label">รหัสพนักงาน</label>
            <input
              type="text"
              name="Em_id"
              value={formData.Em_id}
              placeholder="รหัสพนักงาน"
              className="form-control"
              readOnly
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">ชื่อพนักงาน</label>
            <input
              type="text"
              name="Em_name"
              value={formData.Em_name}
              onChange={handleChange}
              placeholder="ชื่อพนักงาน"
              className="form-control"
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">สถานะ</label>
            <select
              name="Em_status"
              value={formData.Em_status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- เลือกสถานะ --</option>
                <option value="ทำงาน">ทำงาน</option>
                <option value="ลาออก">ลาออก</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">เบอร์โทร</label>
            <input
              type="text"
              name="Em_tel"
              value={formData.Em_tel}
              onChange={handleChange}
              placeholder="เบอร์โทร"
              className="form-control"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
            <label className="form-label">วันที่เริ่มงาน</label>
            <input
              type="date"
              name="Em_date"
              value={formData.Em_date}
              onChange={handleChange}
              placeholder="วันที่เริ่มงาน"
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">ชื่อผู้ใช้</label>
            <input
              type="text"
              name="Em_username"
              value={formData.Em_username}
              onChange={handleChange}
              placeholder="ชื่อผู้ใช้"
              className="form-control"
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">รหัสผ่าน</label>
            <input
              type="text"
              name="Em_password"
              value={formData.Em_password}
              onChange={handleChange}
              placeholder="รหัสผ่าน"
              className="form-control"
            />
          </div>

            <div className="col-md-3">
                <label className="form-label">เพศ</label>
            <select
              name="Em_gender"
              value={formData.Em_gender}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">-- เพศ --</option>
                <option value="ชาย">ชาย</option>
                <option value="หญิง">หญิง</option>
            </select>

          </div>
        </div>

           <div className="row mb-3">
          <div className="col-md-12">
            <label className="form-label">ที่อยู่</label>
            <textarea
              type="text"
              name="Em_address"
              value={formData.Em_address}
              onChange={handleChange}
              placeholder="ที่อยู่"
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
          <label className="form-label">ค้นหาพนักงาน</label>
          <input
            type="text"
            placeholder="ค้นหารหัสหรือชื่อพนักงาน"
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
            <th>รหัสพนักงาน</th>
            <th>ชื่อพนักงาน</th>
            <th>เพศ</th>
            <th>เบอร์โทร</th>
            <th>วันที่เริ่มงาน</th>
            <th>สถานะ</th>
            <th>ที่อยู่</th>
            <th>ชื่อผู้ใช้</th>
            <th>จัดการ</th>
            </tr>
        </thead>
        <tbody>
            {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
                <tr key={index}>
                <td>{item.Em_id}</td>
                <td>{item.Em_name}</td>
                <td>{item.Em_gender}</td>
                <td>{item.Em_tel}</td>
                <td>{item.Em_date ? new Date(item.Em_date).toLocaleDateString("th-TH") : "-"}</td>
                <td>{item.Em_status}</td>
                <td>{item.Em_address}</td>
                <td>{item.Em_username}</td>
                <td>
                    <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(item)}
                    >
                    แก้ไข
                    </button>
                    <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(item.Em_id)}
                    >
                    ลบ
                    </button>
                </td>
                </tr>
            ))
            ) : (
            <tr>
                <td colSpan="9" className="text-center">ไม่พบข้อมูล</td>
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

export default Employee;
