import React from "react";

const Admin_Customers = () => {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl bg-zinc-100 p-10 shadow-lg">
      <h1 className="roboto-medium self-center px-1 pb-5 text-xl text-zinc-500">
        Add New Product
      </h1>
      <div className="flex flex-shrink-0 flex-wrap gap-5 justify-center">
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Name:</label>
          <input
            className="h-10 w-40 select-none rounded-sm bg-zinc-50 px-3 py-2 text-zinc-700 outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400"
            placeholder=""  
          ></input>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-base font-medium">Brand:</label>
          <input
            className="h-10 w-40 select-none rounded-sm bg-zinc-50 px-3 py-2 text-zinc-700 outline-none ring-1 ring-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-400"
            placeholder=""
          ></input>
        </div>
        
      </div>
    </div>
  );
};

export default Admin_Customers;
