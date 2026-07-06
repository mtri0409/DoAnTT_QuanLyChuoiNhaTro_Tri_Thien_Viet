import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TenantLayout = () => {
  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      <Navbar />

      <main className="flex-grow-1 py-4 container-fluid px-lg-5">
        <div className="animate__animated animate__fadeIn">
          <Outlet />
        </div>
      </main>

     <Footer/>
    </div>
  );
};

export default TenantLayout;