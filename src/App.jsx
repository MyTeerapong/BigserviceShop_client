import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard/dashboard';
import Layout from '../sidebar';
import Type  from './MasterData/type';
import Brand  from './MasterData/brand';
import Product  from './MasterData/product';
import Employee  from './MasterData/employee';
import Dealer  from './MasterData/dealer';
import Receive  from './Stock/receive';
import Change  from './Stock/change';
import Sell  from './Stock/sell';
import Home from '/home';

function App() {
  return (
    <Routes>
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
        <Route path="sell" element={<Sell />} />
      </Route>
    </Routes>
  );
}

export default App;
