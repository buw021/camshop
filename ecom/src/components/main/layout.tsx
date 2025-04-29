import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import { CartProvider } from "../../contexts/CartContext";
import { WishlistProvider } from "../../contexts/WishlistContext";
import CategoryNav from "./CategoryNav";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <CartProvider>
        <WishlistProvider>
          <Navbar />
          <main className="flex w-full flex-col gap-2 px-6 py-16 md:px-[10vw] flex-1">
            {children}
          </main>
          <CategoryNav></CategoryNav>
          <Footer></Footer>
        </WishlistProvider>
      </CartProvider>
    </>
  );
};

export default Layout;
