import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

interface MenuList {
  content: string;
  icon: string;
}

const menuItems = [
  { content: "camera", icon: "photo_camera" },
  { content: "lens", icon: "camera" },
  { content: "home", icon: "home" },
  { content: "accessories", icon: "devices_other" },
  { content: "other", icon: "apps" },
];

const transformTitle = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const CategoryNav = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const lastSegment = pathname.split("/").filter(Boolean).pop();
  const [activeLink, setActiveLink] = useState<string>(
    lastSegment?.toString() || "",
  );
  const navigate = useNavigate();
  const RenderMenuList = React.memo(({ content, icon }: MenuList) => {
    return (
      <button
        className={`relative flex h-9 select-none flex-col items-center hover:cursor-pointer ${
          activeLink === content
            ? "border-white text-white"
            : "border-zinc-800 text-zinc-400"
        }`}
        onClick={() => handleNavigate(content)}
      >
        <span
          className={`material-symbols-outlined z-10 text-center`}
          title={transformTitle(content)}
        >
          {icon}
        </span>

        <div className={`absolute bottom-0 text-[10px] transition-all`}>
          <span>{transformTitle(content)}</span>
        </div>
      </button>
    );
  });

  useEffect(() => {
    setActiveLink(lastSegment?.toString() || "home");
  }, [lastSegment]);

  const handleNavigate = (to: string) => {
    setActiveLink(to);
    navigate(`/${to === "home" ? "" : to}`);
  };

  return (
    <nav className="fixed bottom-0 w-full bg-zinc-800 p-1.5 md:hidden">
      <ul className="flex w-full justify-around">
        {menuItems.map((item, index) => (
          <RenderMenuList
            key={index}
            content={item.content}
            icon={item.icon}
          ></RenderMenuList>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNav;
