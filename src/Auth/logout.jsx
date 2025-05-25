import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token'); // หรือลบ sessionStorage ก็ได้
    navigate('/login'); // ไปหน้า login
  }, [navigate]);

  return null; // ไม่ต้องแสดงอะไร
}
