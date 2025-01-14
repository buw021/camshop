// useUserSession.ts
import { useState, useEffect } from "react";
import axios from "axios";

const useUserSession = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get("/get-user");
        if (response.data && response.data.user) {
          setToken(response.data.token); // Set token if user data exists
        } else {
          setToken(null); // If no user data, clear the token
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setToken(null); // If there is an error, clear the token
      }
    };

    fetchUser();
  }, []); // Empty array ensures this only runs once (when the component mounts)

  return token;
};

export default useUserSession;
