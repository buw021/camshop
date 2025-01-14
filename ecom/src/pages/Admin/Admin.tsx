import axios from "axios";

import { AuthProvider } from "./Context/adminAuth";
import AdminRoutes from "./Routes/adminRoutes";

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

const Admin = () => {
  return (
    <AuthProvider>
      <AdminRoutes></AdminRoutes>
    </AuthProvider>
  );
};

export default Admin;
