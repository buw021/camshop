import React, { ReactNode } from "react";

interface Navbar {
  expanded: boolean;
  children: ReactNode;
}
const Admin_Layout: React.FC<Navbar> = ({ expanded, children }) => {
  return (
    <>
      <div
        className={`${expanded ? "sm:pl-[182px]" : "sm:pl-[78px]"} fixed z-[100] h-full w-full pb-[68px] pl-2 pr-2 pt-16 sm:pb-2 sm:transition-all sm:duration-300`}
      >
        <section className={`h-full w-full`}>{children}</section>
      </div>
    </>
  );
};

export default Admin_Layout;
