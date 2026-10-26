import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* TOP NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="min-h-[calc(100vh-70px)] bg-slate-50">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default DashboardLayout;