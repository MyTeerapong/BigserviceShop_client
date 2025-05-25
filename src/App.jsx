import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Auth/login';
import Dashboard from './Dashboard/dashboard';
import Layout from '../sidebar';
import Type from './MasterData/type';
import Brand from './MasterData/brand';
import Product from './MasterData/product';
import Employee from './MasterData/employee';
import Dealer from './MasterData/dealer';
import Receive from './Stock/Receive/receive';
import Change from './Stock/Change/change';
import Insertchange from './Stock/Change/insertChange';
import Home from '/home';
import InsertReceive from './Stock/Receive/insertReceive';
import EditReceive from './Stock/Receive/editReceive';
import Sale from './Stock/Sale/sale';
import InsertSale from './Stock/Sale/insertsale';
import EditSale from './Stock/Sale/editSale';
import Logout from './Auth/logout';

import ReportType from './report/report_type';
import ReportBrand from './report/report_brand';
import ReportProduct from './report/report_product';
import ReportEmployee from './report/report_employee';
import ReportDealer from './report/report_dealer';

function App() {
  return (
    <Routes>
      {/* หน้าแรก */}
      <Route path="/login" element={<Login />} />

      {/* หน้าอื่นๆ */}

      {/* หน้าอื่นๆ ครอบด้วย Layout */}
      <Route path="/" element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="type" element={<Type />} />
        <Route path="brand" element={<Brand />} />
        <Route path="product" element={<Product />} />
        <Route path="employee" element={<Employee />} />
        <Route path="dealer" element={<Dealer />} />
        <Route path="receive" element={<Receive />} />
        <Route path="change" element={<Change />} />
        <Route path="insertChange/:S_id" element={<Insertchange />} />
        <Route path="sale" element={<Sale />} />
        <Route path="insertSale" element={<InsertSale />} />
        <Route path="editSale/:S_id" element={<EditSale />} />
        <Route path="insertReceive" element={<InsertReceive />} />
        <Route path="editReceive/:R_id" element={<EditReceive />} />
        <Route path="logout" element={<Logout />} />

        <Route path="report_type" element={<ReportType />} />
        <Route path="report_brand" element={<ReportBrand />} />
        <Route path="report_product" element={<ReportProduct />} />
        <Route path="report_employee" element={<ReportEmployee />} />
        <Route path="report_dealer" element={<ReportDealer />} />
      </Route>
    </Routes>
  );
}

export default App;
