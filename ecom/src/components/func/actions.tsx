import axios from "axios";

export const actions = async (action: string, addressId: string) => {
  switch (action) {
    case "setDefault":
      if (addressId) {
        try {
          const response = await axios.post("/set-address-default", {
            addressId,
          });
          
          console.log(response);
          return response.data;
        } catch (error) {
          console.error("Error setting default address:", error);
          throw error;
        }
      } else {
        console.error("Missing addressId");
        throw new Error("Missing addressId");
      }
  }
};

