import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import { CartProvider } from "../../contexts/CartContext";
import { WishlistProvider } from "../../contexts/WishlistContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <CartProvider>
        <WishlistProvider>
          <Navbar />
          <div className="flex flex-col px-6 md:px-[10vw]">
            <div className="mt-20">
              <main className="flex flex-col gap-2">{children}</main>
            </div>
          </div>
        </WishlistProvider>
      </CartProvider>
    </>
  );
};

export default Layout;
