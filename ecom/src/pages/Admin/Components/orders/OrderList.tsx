import React from "react";

const Row_Cells: React.FC<{
  order: [];
}> = ({ order }) => (
  <tr className="hover:bg-zinc-200">
    <td className="flex items-center px-4 py-2">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
      />
    </td>
    <td className="px-6 text-center">{1}</td>
    <td className="px-6 text-center"></td>
    <td className="px-6 text-center">
      <button className="text-blue-600 hover:text-blue-900">Manage</button>
    </td>
  </tr>
);

const OrderList = () => {
  return (
    <>
      <div className="flex items-center justify-between"></div>
      <div className="relative h-full w-full overflow-auto rounded">
        <table className="w-full table-auto divide-y divide-gray-300 text-sm">
          <thead className="h-8 bg-zinc-200">
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
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                No
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Order ID:
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Code
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Value
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Minimum Order
              </th>

              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Days/Time Left
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Usage Count Left
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Start Date
              </th>
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                End Date
              </th>
              {/*   <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Keywords {"(Conditions)"}
              </th> */}
              <th className="px-6 text-center font-medium uppercase tracking-wider text-zinc-500">
                Manage
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300"></tbody>
        </table>
      </div>
    </>
  );
};

export default OrderList;
