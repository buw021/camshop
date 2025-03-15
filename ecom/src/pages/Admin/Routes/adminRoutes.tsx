import { Routes, Route, Navigate } from "react-router-dom";
import Admin_Orders from "../Pages/Admin_Orders";
import { useAuth } from "../Context/adminAuth";
import { useState } from "react";
import Admin_Layout from "../Pages/Admin_Layout";
import Admin_Navbar from "../Components/Admin_Navbar";
import Admin_Login from "../Pages/Admin_Login";
import Admin_Products from "../Pages/Admin_Products";
import Admin_Promotion from "../Pages/Admin_Promotion";
import Admin_Customers from "../Pages/Admin_Customers";
import Admin_Reports from "../Components/Admin_Reports";
import Admin_Dashboard from "../Components/Admin_Dashboard";

const AdminRoutes = () => {
  const { token, loading } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  if (loading) {
    return (
      <div className="fixed left-0 top-0 z-[100] flex h-screen w-screen items-center justify-center bg-white">
        <div
          className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-zinc-900 motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Admin_Login />;
  }

  return (
    <>
      <Admin_Navbar
        expanded={isExpanded}
        setExpanded={setIsExpanded}
        user={token}
        isDirty={isDirty}
        setIsDirty={setIsDirty}
      >
        <Admin_Layout expanded={isExpanded}>
          <Routes>
            <Route
              path="/products"
              element={<Admin_Products setIsDirty={setIsDirty} />}
            />
            <Route path="/promotions" element={<Admin_Promotion />} />
            <Route path="/customers" element={<Admin_Customers />} />
            <Route path="/orders" element={<Admin_Orders />} />
            <Route path="/reports" element={<Admin_Reports />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            <Route path="/dashboard" element={<Admin_Dashboard />} />
          </Routes>
        </Admin_Layout>
      </Admin_Navbar>
    </>
  );
};

export default AdminRoutes;
