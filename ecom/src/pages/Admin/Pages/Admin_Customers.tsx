import React, { useCallback, useEffect, useState } from "react";
import { CustomerProps } from "../Components/interface/interfaces";
import axiosInstance from "../Services/axiosInstance";
import CustomerList from "../Components/customers/CustomerList";
import CustomerSearchBar from "../Components/customers/CustomerSearchBar";
import ManageCustomerInfo from "../Components/customers/CustomerInfo";

const Admin_Customers = () => {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerProps | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getCustomers = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-users", {
        params: { searchQuery },
      });
      if (response.status === 200) setCustomers(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [searchQuery]);

  useEffect(() => {
    getCustomers();
  }, [getCustomers]);

  const manageCustomer = (customer: CustomerProps) => {
    setSelectedCustomer(customer);
  };

  const closeManageCustomer = () => {
    setSelectedCustomer(null);
  };

  return (
    <div className="relative flex h-full w-full flex-col gap-1 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:p-10">
      {selectedCustomer && (
        <>
          <ManageCustomerInfo
            customer={selectedCustomer}
            customertList={customers}
            setCustomer={manageCustomer}
            close={closeManageCustomer}
          />
        </>
      )}
      <h1 className="mb-2 text-xl font-bold tracking-wide">Customer List</h1>
      <CustomerSearchBar
        getFilters={(filter) => setSearchQuery(filter.searchQuery)}
      />
      <CustomerList
        customers={customers}
        manageCustomer={manageCustomer}
      ></CustomerList>
    </div>
  );
};

export default Admin_Customers;
