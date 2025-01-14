
import axiosInstance from "./axiosInstance";

class UserService {
  async getUserSession() {
    const response = await axiosInstance.get("/get-user");
   
    return response.data; 
  }
}

export default new UserService();
