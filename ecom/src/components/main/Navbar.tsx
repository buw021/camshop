/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Wishlist from "./Wishlist";
import Cart from "./Cart";
import MiniAuth from "./MiniAuth";
import axiosInstance from "../../services/axiosInstance";
import { useAuth } from "../../contexts/useAuth";
import { showToast } from "../func/showToast";
import { SearchBar } from "./SearchBar";
import { useCart } from "../../contexts/useCart";
import { useLocation } from "react-router-dom";

interface IconButtonProps {
  icon: string;
  onClick: () => void;
  additionalClasses?: string;
}

const Navbar = () => {
  const { token } = useAuth();
  const { cartIDs } = useCart();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [expand, setExpand] = useState(false);
  const [expandSearch, setExpandSearch] = useState(false);
  const [expandCart, setExpandCart] = useState(false);
  const [expandMenu, setExpandMenu] = useState(false);
  const [expandProfile, setExpandProfile] = useState(false);
  const [expantFav, setExpandFav] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");
    try {
      await axiosInstance.post("/logout");
      window.location.href = "/";
    } catch (error) {
      showToast("Logout failed. Please try again.", "error");
    }
  };

  const handleToggle = (
    stateSetter: React.Dispatch<React.SetStateAction<boolean>>,
    focusRef?: React.RefObject<HTMLInputElement>,
  ) => {
    return () => {
      setExpand(true);
      setExpandMenu(stateSetter === setExpandMenu);
      setExpandCart(stateSetter === setExpandCart);
      setExpandSearch(stateSetter === setExpandSearch);
      setExpandProfile(stateSetter === setExpandProfile);
      setExpandFav(stateSetter === setExpandFav);

      if (focusRef) {
        setTimeout(() => {
          focusRef.current?.focus();
        }, 500);
      }
    };
  };

  const toggleMenu = handleToggle(setExpandMenu);
  const toggleClose = () => {
    setExpand(false);
    setExpandMenu(false);
    setExpandCart(false);
    setExpandSearch(false);
    setExpandProfile(false);
    setExpandFav(false);
  };
  const toggleSearch = handleToggle(setExpandSearch, searchRef);
  const toggleCart = handleToggle(setExpandCart);
  const toggleProfile = handleToggle(setExpandProfile);
  const toggleFav = handleToggle(setExpandFav);

  const handleClickOutside = (event: MouseEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      toggleClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  useEffect(() => {
    if (expand || expandCart || expandSearch || expandMenu || expandProfile) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [expand, expandCart, expandSearch, expandMenu, expandProfile]);

  const categories = ["Camera", "Lens", "Accessories", "Other"];

  const IconButton: React.FC<IconButtonProps> = ({
    icon,
    onClick,
    additionalClasses = "",
  }) => (
    <span
      className={`material-symbols-outlined text-zinc-800 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500 ${expand ? "invisible -z-50 opacity-0" : ""} ${additionalClasses}`}
      onClick={onClick}
    >
      {icon}
    </span>
  );

  return (
    <nav
      ref={navRef}
      className={`transit</span>ion-all fixed z-50 flex w-full transform select-none flex-col bg-white shadow backdrop-blur-lg duration-700 ${expand ? "h-[100vh] md:h-[500px]" : "h-14"}`}
    >
      <div className="flex h-auto w-full flex-col overflow-hidden px-5 py-3 md:px-[10vw]">
        <div className="flex flex-row items-center justify-between">
          <div className="md:order-0 order-1 flex flex-row items-center gap-6">
            <Link to={`/`}>
              <div
                className={`roboto-medium relative transition-opacity duration-100 ease-linear ${
                  expand ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className={`text-3xl text-zinc-800`}>camshop</span>
                <span className="absolute bottom-4 right-4 text-2xl text-red-700">
                  .
                </span>
              </div>
            </Link>
            <ul
              className={`order-1 hidden flex-row gap-4 transition-all duration-100 ease-linear md:flex ${
                expand ? "-z-50 hidden opacity-0" : ""
              }`}
            >
              {categories.map((category, index) => (
                <li
                  key={index}
                  className={`group relative flex flex-col items-center justify-between lowercase hover:cursor-pointer ${
                    expand ? "invisible -z-50 opacity-0" : ""
                  }`}
                >
                  <span className="roboto-regular group- flex text-base text-zinc-700 transition-all duration-200 hover:text-zinc-900">
                    <Link to={`/${category.toLowerCase()}`}>{category}</Link>
                  </span>
                  <div className="absolute bottom-0 flex w-full items-center justify-center">
                    <div className="w-[50%] overflow-hidden">
                      <div className="h-[1px] w-full translate-x-20 bg-zinc-300 transition-all duration-300 ease-in group-hover:translate-x-0"></div>
                    </div>
                    <div className="w-[50%] overflow-hidden">
                      <div className="h-[1px] w-full -translate-x-20 bg-zinc-300 transition-all duration-300 ease-in group-hover:translate-x-0"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-0 flex items-center justify-end gap-2 md:z-0 md:order-1 md:hidden md:gap-4">
            <IconButton icon="menu" onClick={toggleMenu} />{" "}
            <IconButton icon="search" onClick={toggleSearch} />{" "}
          </div>
          <div className="order-2 flex items-center justify-end gap-2">
            <IconButton
              icon="search"
              onClick={toggleSearch}
              additionalClasses="hidden md:block"
            />
            {currentPath !== "/checkout" && (
              <>
                <IconButton
                  icon="favorite"
                  onClick={toggleFav}
                  additionalClasses="filled"
                />
                <div className="group relative flex items-center">
                  {cartIDs.reduce((total, item) => total + item.quantity, 0) >
                    0 && (
                    <span
                      className={`absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[8px] text-white transition-all duration-100 ease-linear group-hover:bg-red-400 ${expand ? "invisible -z-50 opacity-0" : ""}`}
                    >
                      {cartIDs.reduce(
                        (total, item) => total + item.quantity,
                        0,
                      )}
                    </span>
                  )}
                  <IconButton
                    icon="shopping_cart"
                    onClick={toggleCart}
                    additionalClasses="filled"
                  />
                </div>
              </>
            )}
            <IconButton
              icon="person"
              onClick={toggleProfile}
              additionalClasses="filled group relative"
            />
            <span
              className={`material-symbols-outlined absolute text-zinc-800 transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500 ${expand ? "" : "invisible rotate-180 -scale-100 opacity-0"}`}
              onClick={toggleClose}
            >
              close
            </span>
          </div>
        </div>
        <div
          className={`flex flex-col overflow-hidden text-black transition-all duration-500 ${expand ? "opacity-100" : "invisible opacity-0"}`}
        >
          {expandSearch && (
            <div className="flex flex-col gap-4">
              <SearchBar
                searchRef={searchRef}
                toggleClose={toggleClose}
              ></SearchBar>
            </div>
          )}

          {expantFav && <Wishlist></Wishlist>}

          {expandCart && (
            <Cart checkout={false} toggleClose={toggleClose}></Cart>
          )}

          {expandMenu && (
            <>
              <ul className="flex flex-col">
                {categories.map((category, index) => (
                  <li key={index}>
                    <Link
                      to={`/${category.toLowerCase()}`}
                      onClick={toggleClose}
                    >
                      <div className="group relative flex cursor-pointer items-center justify-between">
                        <span className="flex-transition-all roboto-medium text-2xl tracking-wide text-zinc-700 duration-200 group-hover:text-zinc-900 md:text-3xl">
                          {category}
                        </span>

                        <span
                          className={`item-center material-symbols-outlined filled absolute flex w-full -translate-x-1 justify-end bg-transparent text-lg text-zinc-500 opacity-0 transition-all duration-200 ease-linear group-hover:translate-x-0 group-hover:opacity-100 md:w-[50%]`}
                        >
                          arrow_forward_ios
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {expandProfile && (
            <>
              {token ? (
                <section className="bottom-0 flex flex-col gap-2 self-end text-right">
                  <p>
                    <span className="roboto-medium text-lg underline"></span>
                  </p>
                  <ul className="flex flex-col gap-1 text-xl">
                    <li className="group relative cursor-pointer items-center justify-between">
                      <Link to={`/my-orders`} onClick={toggleClose}>
                        <span className="flex-transition-all roboto-medium relative text-zinc-700 duration-200 group-hover:text-zinc-900">
                          Orders
                          <div className="absolute -bottom-1 left-0 w-full">
                            <div className="overflow-hidden">
                              <div className="h-[1px] w-full translate-x-20 bg-zinc-300 transition-all duration-300 ease-in group-hover:translate-x-0"></div>
                            </div>
                          </div>
                        </span>
                      </Link>
                    </li>
                    <li className="group relative cursor-pointer items-center justify-between">
                      <Link to={`/my-profile`} onClick={toggleClose}>
                        <span className="flex-transition-all roboto-medium relative text-zinc-700 duration-200 group-hover:text-zinc-900">
                          Profile
                          <div className="absolute -bottom-1 left-0 w-full">
                            <div className="overflow-hidden">
                              <div className="h-[1px] w-full translate-x-20 bg-zinc-300 transition-all duration-300 ease-in group-hover:translate-x-0"></div>
                            </div>
                          </div>
                        </span>
                      </Link>
                    </li>

                    <li className="group relative cursor-pointer items-center justify-between">
                      <span
                        className="flex-transition-all roboto-medium relative text-zinc-700 duration-200 group-hover:text-zinc-900"
                        onClick={handleLogout}
                      >
                        Log out
                        <div className="absolute -bottom-1 left-0 w-full">
                          <div className="overflow-hidden">
                            <div className="h-[1px] w-full translate-x-20 bg-zinc-300 transition-all duration-300 ease-in group-hover:translate-x-0"></div>
                          </div>
                        </div>
                      </span>
                    </li>
                  </ul>
                </section>
              ) : (
                <>
                  <MiniAuth></MiniAuth>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
