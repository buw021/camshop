import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../Services/axiosInstance";
import { OrderProps } from "../Components/interface/interfaces";
import ManageOrder from "../Components/notifications/ViewOrder";

interface NotificationProps {
  orderId: string;
  customOrderId: string;
  type: string;
  status: string;
  createdAt: Date;
  _id: string;
}

const Admin_Notifications = () => {
  const [type, setType] = useState<"all" | "unread">("unread");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderProps | null>();
  const getNotifications = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/get-notifications", {
        params: { type, page, limit },
      });
      if (response.data) {
        setTotal(response.data.total);

        // Append if loading more, reset if type changed
        setNotifications((prev) =>
          page === 1
            ? response.data.notifications
            : [...prev, ...response.data.notifications],
        );
      }
    } catch (error) {
      console.log(error);
    }
  }, [limit, page, type]);
  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const fetchOrderData = async (orderId: string) => {
    try {
      const response = await axiosInstance.get("/fetch-order-data", {
        params: { orderId },
      });
      if (response.data) {
        setCurrentOrder(response.data.currentOrder);
      }
    } catch (error) {
      console.error("Failed to fetch order data:", error);
    }
  };

  const closeManageOrder = () => {
    setCurrentOrder(null);
  };

  const updateToRead = async (id: string) => {
    try {
      const response = await axiosInstance.post("/update-notification", { id });
      if (response.status === 200) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, status: "read" } : n)),
        );
        /* if (type === "unread") {
          getNotifications();
        } */
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadMore = () => {
    if (page < Math.ceil(total / limit)) {
      setPage(page + 1);
    }
  };

  return (
    <div className="relative flex h-full w-full flex-col gap-1 rounded-xl bg-white p-4 ring-2 ring-zinc-300/70 sm:p-10">
      {currentOrder && (
        <ManageOrder
          order={currentOrder}
          close={closeManageOrder}
          fetchOrder={fetchOrderData}
        ></ManageOrder>
      )}
      <h1 className="roboto-bold self-start text-xl text-zinc-800">
        Notifications
      </h1>
      <div className="relative mb-2 flex items-center justify-between self-start">
        <div className="flex gap-2">
          <button
            className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 px-2 hover:cursor-pointer hover:bg-zinc-200 ${type === "unread" ? "bg-zinc-200" : "bg-zinc-100"}`}
            onClick={(e) => {
              setType("unread");
              e.preventDefault();
            }}
          >
            Unread
          </button>
          <button
            className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 px-2 hover:cursor-pointer hover:bg-zinc-200 ${type === "all" ? "bg-zinc-200" : "bg-zinc-100"}`}
            onClick={(e) => {
              setType("all");
              e.preventDefault();
            }}
          >
            All
          </button>
        </div>
      </div>

      <div className="flex w-full max-w-xl gap-2 self-center overflow-y-auto rounded-md border border-zinc-200 p-4">
        {notifications?.length === 0 ? (
          <div className="w-full text-center text-zinc-400">
            {type === "unread"
              ? "No unread notifications"
              : "No notifications found."}
          </div>
        ) : (
          <ul className="flex w-full flex-col gap-3">
            {notifications.map((notification) => (
              <>
                <li
                  key={notification.orderId}
                  className={`"flex w-full flex-col gap-1 rounded border p-3 ${notification.status === "unread" ? "bg-zinc-100" : "border-zinc-100 bg-zinc-50/70"} hover:cursor-pointer hover:border-zinc-300 hover:bg-zinc-200`}
                  onClick={async () => {
                    await updateToRead(notification._id);
                    await fetchOrderData(notification.orderId);
                  }}
                  role="button"
                >
                  <div className="flex w-full flex-col justify-between sm:flex-row sm:items-center">
                    <span
                      className={`flex items-center gap-2 ${notification.status === "unread" ? "roboto-medium text-zinc-700" : ""}`}
                    >
                      {notification.customOrderId}{" "}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="self text-sm capitalize text-zinc-600">
                    Order Status: {notification.type}
                  </div>
                </li>
              </>
            ))}
          </ul>
        )}
      </div>
      {page < Math.ceil(total / limit) && (
        <button
          onClick={() => {
            loadMore();
          }}
          disabled={page >= Math.ceil(total / limit)}
          className={`mx-1 mt-1 w-full max-w-xl self-center rounded-full bg-zinc-700 px-2.5 py-1 text-sm font-bold text-white hover:bg-zinc-800`}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default Admin_Notifications;
