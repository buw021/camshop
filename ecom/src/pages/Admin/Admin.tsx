import axios from "axios";

import { AuthProvider } from "./Context/adminAuth";
import AdminRoutes from "./Routes/adminRoutes";

axios.defaults.baseURL = "http://192.168.0.6:3000";
axios.defaults.withCredentials = true;

const Admin = () => {
  return (
    <AuthProvider>
      <AdminRoutes></AdminRoutes>
    </AuthProvider>
  );
};

export default Admin;
