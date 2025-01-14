import React from "react";

const PromoList = () => {
  return (
    <div className="relative h-full w-full overflow-auto rounded">
      <table className="w-full table-auto divide-y divide-gray-300 text-sm">
        <thead className="bg-zinc-200">
          <tr className="">
            <th scope="col" className="px-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <label className="sr-only">checkbox</label>
              </div>
            </th>
            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              ID No.
            </th>

            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              Code
            </th>
            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              Description
            </th>
            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              Type
            </th>
            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              Value
            </th>
            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              Start Date
            </th>
            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              End Date
            </th>
            <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
              Days/Time Left
            </th>
            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              Usage Limit
            </th>
            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              Usage Count
            </th>
            <th className="px-6 text-left font-medium uppercase tracking-wider text-zinc-500">
              Conditions
            </th>
            <th scope="col" className="p-4">
              <span className="sr-only">Manage</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300"></tbody>
      </table>
    </div>
  );
};

export default PromoList;
