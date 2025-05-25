import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/auth/login", {
        Em_username: username,
        Em_password: password,
      });

      Swal.fire("เข้าสู่ระบบสำเร็จ", "ยินดีต้อนรับ!", "success");
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      Swal.fire("เข้าสู่ระบบล้มเหลว", "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", "error");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <form onSubmit={handleLogin} className="bg-white p-5 rounded shadow w-100" style={{ maxWidth: "400px" }}>
        <h2 className="text-center mb-4">เข้าสู่ระบบ</h2>
        <div className="mb-3">
          <label className="form-label">ชื่อผู้ใช้</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">รหัสผ่าน</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  );
};

export default Login;
