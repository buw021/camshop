import React, { useCallback, useEffect, useState } from "react";
/* import { AnimatePresence, motion } from "framer-motion"; */
import axios from "axios";
import { Bounce, toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { socket } from "../Services/socket";
import { showToast } from "./showToast";
import axiosInstance from "../Services/axiosInstance";
interface Navbar {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  children: React.ReactNode;
  user: unknown;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
}

const Admin_Navbar: React.FC<Navbar> = ({
  expanded,
  setExpanded,
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,
  user,
  isDirty,
  setIsDirty,
}) => {
  const location = useLocation();
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  const [activeLink, setActiveLink] = useState<string>(
    lastSegment?.toString() || "",
  );
  const [expandSideBar, setExpandSideBar] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notif, setNotif] = useState<number>(0);
  /*   const [toggleProfile, setToggleProfile] = useState(false); */
  const navigate = useNavigate();
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout ?"))
      try {
        await axios.post("/logout-admin");
        window.location.reload();
      } catch (error) {
        toast.error("Logout failed. Please try again.", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
      }
  };

  const toggleSideBar = () => {
    setExpandSideBar(!expandSideBar);
    expanded = expandSideBar;
    setExpanded(!expanded);
  };

  /* const variants = {
    entrance: {
      opacity: 1,
      x: 0,
      transition: { ease: "linear", duration: 0.2 },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { ease: "linear", duration: 0.2 },
    },
    "logo-entrance": {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    "logo-exit": {
      opacity: 0,
      scale: -1,
      transition: { duration: 0.3 },
    },
    "menu-entrance": {
      opacity: 1,
      y: 0,
      transition: { ease: "linear", duration: 0.2 },
    },
    "menu-exit": {
      opacity: 0,
      y: -10,
      transition: { ease: "linear", duration: 0.2 },
    },
  }; */

  const transformTitle = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  interface MenuList {
    content: string;
    icon: string;
  }

  const menuItems = [
    { content: "dashboard", icon: "dashboard" },
    { content: "products", icon: "inventory_2" },
    { content: "orders", icon: "orders" },
    { content: "customers", icon: "group" },
    { content: "promotions", icon: "sell" },
    { content: "reports", icon: "bar_chart" },
  ];

  const handleNavigate = (to: string) => {
    if (isDirty) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Do you really want to leave?",
      );
      if (!confirmLeave) return;
    }
    setIsDirty(false);
    setActiveLink(to);
    navigate(`/admin/${to}`);
  };
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    setActiveLink(lastSegment?.toString() || "");
  }, [lastSegment]);

  const RenderMenuList = React.memo(({ content, icon }: MenuList) => {
    return (
      <button
        className={`flex flex-row items-center gap-3 overflow-hidden rounded-full p-2 transition-all duration-300 hover:cursor-pointer hover:bg-white/20 sm:rounded-md sm:py-2 sm:pl-[7px] sm:pr-0 ${
          activeLink === content ? "bg-white/50 hover:bg-white/50" : ""
        }`}
        onClick={() => {
          handleNavigate(content);
        }}
      >
        <span
          className={`material-symbols-outlined z-10 text-center ${
            expandSideBar ? "" : ""
          }`}
          title={transformTitle(content)}
        >
          {icon}
        </span>

        <div
          className={`hidden pr-1 sm:flex ${!expandSideBar && "animate-fade-out"}`}
        >
          <span>{transformTitle(content)}</span>
        </div>
      </button>
    );
  });

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Connected to WebSocket:", socket.id);
    });

    socket.on("new-order", (data) => {
      console.log("🆕 New Order Notification:", data);

      // Example: Show toast
      showToast(`📦 New Order: ${data.customOrderID}`, "info");

      // Optional: Update notification badge or list in state
      // updateNotificationState(data);
    });

    socket.on("notification:unreadCount", (data) => {
      setNotif(data.unreadCount);
    });

    return () => {
      socket.off("connect");
      socket.off("new-order");
      socket.off("notification:unreadCount");
    };
  }, []);

  const getUnreadCount = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/get-unreadCount");
      setNotif(res.data);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getUnreadCount();
  }, [getUnreadCount]);

  return (
    <>
      <div className="fixed z-[101] flex w-full">
        <nav
          className={`fixed bottom-0 z-[102] w-screen flex-shrink-0 select-none flex-col items-center rounded-t-xl bg-zinc-900 py-2 sm:static sm:flex sm:h-screen sm:rounded-none sm:px-4 sm:transition-all sm:duration-300 ${expandSideBar ? "sm:w-[175px]" : "sm:w-[70px]"}`}
        >
          <div
            className={`roboto-medium relative hidden w-full overflow-hidden transition-all duration-300 sm:flex ${
              expandSideBar ? "" : ""
            }`}
          >
            <div
              className={`absolute px-2 transition-all duration-300 ${
                expandSideBar
                  ? "opacity-100 delay-200"
                  : "invisible -translate-x-5 opacity-0"
              }`}
            >
              <span className={`text-3xl text-white`}>camshop</span>
              <span className="absolute bottom-4 right-6 text-2xl text-red-700">
                .
              </span>
            </div>

            <span
              className={`material-symbols-outlined flex items-center justify-center pl-1 text-3xl text-white transition-all duration-300 ${
                expandSideBar
                  ? "invisible translate-x-5 rotate-180 opacity-0"
                  : "opacity-100"
              }`}
            >
              photo_camera
              <span className="absolute bottom-7 left-4 text-2xl text-red-700">
                .
              </span>
            </span>
          </div>

          <div className="my-3 hidden h-[1px] w-full transform bg-zinc-700 transition-all duration-300 sm:flex"></div>
          <ul className="flex w-full justify-center gap-5 text-white sm:flex-col sm:justify-normal sm:gap-3">
            {menuItems.map((item, index) => (
              <RenderMenuList
                key={index}
                content={item.content}
                icon={item.icon}
              ></RenderMenuList>
            ))}
          </ul>
        </nav>
        <nav
          className={`sticky z-[103] flex h-14 w-full flex-grow-0 select-none flex-row items-center justify-between bg-white px-3 shadow transition-all duration-300`}
        >
          <div className="absolute -left-3 z-20 hidden sm:flex">
            {" "}
            <button
              type="button"
              className="flex h-4 w-4 items-center justify-center rounded-full bg-white p-3 shadow-md drop-shadow transition-all duration-300 hover:bg-zinc-200"
              onClick={toggleSideBar}
            >
              <span
                className={`material-symbols-outlined absolute left-[-1px] transition-all duration-300 ${
                  expandSideBar ? "opacity-100" : "rotate-180 opacity-0"
                }`}
              >
                chevron_left
              </span>
              <span
                className={`material-symbols-outlined absolute right-[-1px] transition-all duration-300 ${
                  expandSideBar ? "-rotate-180 opacity-0" : "opacity-100"
                }`}
              >
                chevron_right
              </span>
            </button>
          </div>
          <div
            className={`order-0 flex w-full flex-row items-center justify-between gap-4 transition-all duration-300`}
          >
            <div
              className={`flex w-full flex-row items-center justify-end gap-4`}
            >
              <button
                className="group relative"
                type="button"
                title="notifications"
                onClick={() => handleNavigate("notifications")}
              >
                {notif > 0 && (
                  <span
                    className={`absolute -right-1 -top-0 z-10 rounded-full bg-red-500 px-1 text-[8px] text-white transition-all duration-100 ease-linear group-hover:bg-red-400`}
                  >
                    {notif}
                  </span>
                )}
                <span
                  className={`material-symbols-outlined filled relative text-[23px] text-zinc-800 transition-all duration-200 ease-linear group-hover:cursor-pointer group-hover:text-zinc-500`}
                >
                  notifications
                </span>
              </button>

              <p>|</p>
              {/*PROFILE MENU!!!!!!! */}
              <button
                title="logout"
                className="group relative flex flex-row items-center gap-1"
                onClick={handleLogout}
              >
                <span
                  className={`material-symbols-outlined filled text-zinc-800 transition-all duration-200 ease-linear group-hover:cursor-pointer group-hover:text-zinc-500`}
                >
                  logout
                </span>
              </button>
              {/*  <button
                className="group relative flex flex-row items-center gap-1"
                onClick={() => {
                  setToggleProfile(!toggleProfile);
                }}
              >
                <span
                  className={`material-symbols-outlined filled text-zinc-800 transition-all duration-200 ease-linear group-hover:cursor-pointer group-hover:text-zinc-500`}
                >
                  person
                </span>

                <span
                  className={`material-symbols-outlined filled -right-4 mt-[4.25px] text-base text-zinc-800 transition-all duration-200 ease-linear group-hover:cursor-pointer group-hover:text-zinc-500`}
                >
                  arrow_drop_down
                </span>
              </button>
              <AnimatePresence>
                {toggleProfile && (
                  <motion.div
                    className={`border-1 border-zinc absolute -bottom-[105px] right-8 flex h-28 w-40 flex-col items-end gap-1 overflow-hidden rounded border bg-white px-4 py-3 shadow`}
                    variants={variants}
                    initial={"menu-exit"}
                    animate={"menu-entrance"}
                    exit={"menu-exit"}
                  >
                    <span className="flex-transition-all roboto-medium w-15 group relative h-5 text-right text-zinc-900 duration-200 group-hover:cursor-pointer group-hover:text-zinc-500">
                      {user !== "" ? "Admin" : "User"}
                      <div className="-bottom-1 left-0 w-full">
                        <div className="overflow-hidden">
                          <div className="h-[1px] w-full translate-x-20 bg-zinc-300 transition-all duration-300 ease-in group-hover:translate-x-0"></div>
                        </div>
                      </div>
                    </span>
                    <span
                      className="flex-transition-all roboto-medium w-15 group relative h-6 text-right text-zinc-900 duration-200 hover:cursor-pointer group-hover:text-zinc-500"
                      onClick={handleLogout}
                    >
                      Log out
                      <div className="-bottom-1 left-0 w-full">
                        <div className="overflow-hidden">
                          <div className="h-[1px] w-full translate-x-20 bg-zinc-300 transition-all duration-300 ease-in group-hover:translate-x-0"></div>
                        </div>
                      </div>
                    </span>
                  </motion.div>
                )}
              </AnimatePresence> */}
              <span
                className={`material-symbols-outlined absolute hidden text-zinc-800 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
              >
                close
              </span>
            </div>
          </div>
        </nav>
        {children}
      </div>
    </>
  );
};

export default Admin_Navbar;
