import * as React from 'react';
import { createTheme } from '@mui/material/styles';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard'; 
import BarChartIcon from '@mui/icons-material/BarChart'; 
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn'; 
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; 
import SellIcon from '@mui/icons-material/Sell'; 
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; 

import { AppProvider } from '@toolpad/core/AppProvider';
import { DashboardLayout } from '@toolpad/core/DashboardLayout';

const demoTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'data-toolpad-color-scheme',
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
});

function DashboardLayoutBasic(props) {
  const { window } = props;
  const navigate = useNavigate();
  const location = useLocation();

  // ตรวจจับ path /logout แล้วทำการ logout
  React.useEffect(() => {
    if (location.pathname === '/logout') {
      localStorage.removeItem('token'); // หรือตามชื่อ key ที่คุณใช้
      navigate('/login');
    }
  }, [location, navigate]);

  const NAVIGATION = [
    { segment: '', title: 'หน้าแรก', icon: <HomeIcon /> },
    { segment: 'dashboard', title: 'แดชบอร์ด', icon: <DashboardIcon /> },
    { kind: 'divider' },
    { kind: 'header', title: 'จัดการข้อมูล' },
    {
      segment: '',
      title: 'บันทึกข้อมูลหลัก',
      icon: <BarChartIcon />,
      children: [
        { segment: 'type', title: 'ประเภทสินค้า', icon: <DescriptionIcon /> },
        { segment: 'brand', title: 'ยี่ห้อสินค้า', icon: <DescriptionIcon /> },
        { segment: 'product', title: 'สินค้า', icon: <DescriptionIcon /> },
        { segment: 'employee', title: 'พนักงาน', icon: <DescriptionIcon /> },
        { segment: 'dealer', title: 'ตัวแทนจำหน่าย', icon: <DescriptionIcon /> },
      ],
    },
    { kind: 'divider' },
    { kind: 'header', title: 'จัดการสินค้า' },
    { segment: 'receive', title: 'รับสินค้า', icon: <ShoppingCartIcon /> },
    { segment: 'sale', title: 'ขายสินค้า', icon: <SellIcon /> },
    { segment: 'change', title: 'เปลี่ยนสินค้า', icon: <AssignmentReturnIcon /> },
    { kind: 'divider' },
    { kind: 'header', title: 'พิมพ์รายงาน' },
    {
      segment: 'reports',
      title: 'รายงาน',
      icon: <BarChartIcon />,
      children: [
        { segment: 'sales', title: 'Sales', icon: <BarChartIcon /> },
        { segment: 'traffic', title: 'Traffic', icon: <BarChartIcon /> },
      ],
    },
    {
      segment: 'logout',
      title: 'ออกจากระบบ',
      icon: <ExitToAppIcon />,
    },
  ];

  return (
    <AppProvider navigation={NAVIGATION} theme={demoTheme} window={window}>
      <DashboardLayout>
        <div style={{ padding: 24 }}>
          <Outlet />
        </div>
      </DashboardLayout>
    </AppProvider>
  );
}

export default DashboardLayoutBasic;
