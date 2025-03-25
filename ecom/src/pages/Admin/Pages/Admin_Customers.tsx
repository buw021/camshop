import { useCallback, useEffect, useState } from "react";
import { CustomerProps } from "../Components/interface/interfaces";
import axiosInstance from "../Services/axiosInstance";
import CustomerList from "../Components/customers/CustomerList";
import CustomerSearchBar from "../Components/customers/CustomerSearchBar";
import ManageCustomerInfo from "../Components/customers/CustomerInfo";

const Admin_Customers = () => {
  const [customers, setCustomers] = useState<CustomerProps[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerProps | null>(null);
  const [manageCustomerInfos, setManageCustomerInfos] = useState<{
    nextId: string | null;
    prevId: string | null;
    currentIndex: number;
    totalCustomers: number;
  }>({
    nextId: null,
    prevId: null,
    currentIndex: 0,
    totalCustomers: 0,
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const totalPages = Math.ceil(customers.length / limit);

  const getCustomers = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-users", {
        params: { searchQuery, currentPage, limit },
      });
      if (response.status === 200) setCustomers(response.data);
    } catch (error) {
      console.log(error);
    }
  }, [currentPage, searchQuery]);

  useEffect(() => {
    getCustomers();
  }, [getCustomers]);

  const getCustomerDetails = async (customerID: string) => {
    try {
      const response = await axiosInstance.get("/get-user-details", {
        params: { customerID },
      });
      if (response.status === 200) return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const manageCustomer = async (customerID: string) => {
    const customerDetails = await getCustomerDetails(customerID);
    if (customerDetails) {
      setSelectedCustomer(customerDetails.user);
      setManageCustomerInfos({
        nextId: customerDetails.nextUser,
        prevId: customerDetails.prevUser,
        currentIndex: customerDetails.userIndex,
        totalCustomers: customerDetails.totalUsers,
      });
    }
  };

  const closeManageCustomer = () => {
    setSelectedCustomer(null);
  };

  const nextPage = async () => {
    if (!manageCustomerInfos.nextId) return; // Prevent navigating if no next order
    await manageCustomer(manageCustomerInfos.nextId);
  };

  const prevPage = async () => {
    if (!manageCustomerInfos.prevId) return; // Prevent navigating if no previous order
    await manageCustomer(manageCustomerInfos.prevId);
  };

  return (
    <div className="relative flex h-full w-full flex-col gap-1 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:p-10">
      {selectedCustomer && (
        <ManageCustomerInfo
          customer={selectedCustomer}
          nextPage={nextPage}
          prevPage={prevPage}
          fetchCustomer={manageCustomer}
          currentIndex={manageCustomerInfos.currentIndex}
          totalUsers={manageCustomerInfos.totalCustomers}
          getCustomers={getCustomers}
          close={closeManageCustomer}
        />
      )}
      <h1 className="mb-2 text-xl font-bold tracking-wide">Customer List</h1>
      <CustomerSearchBar
        getFilters={(filter) => setSearchQuery(filter.searchQuery)}
      />
      <CustomerList
        customers={customers}
        manageCustomer={manageCustomer}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      ></CustomerList>
    </div>
  );
};

export default Admin_Customers;
