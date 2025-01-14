import React from "react";
import { Link } from "react-router-dom";

interface Params {
  category: string;
  subCategory: string;
}

const Navigation: React.FC<Params> = ({ category, subCategory }) => {
  return (
    <div className="h-6 w-full border-b-[1px] border-zinc-200 text-sm">
      <Link to={"/"}>
        <span className="hover:cursor-pointer hover:text-zinc-900 hover:underline">
          home
        </span>
        {category && " > "}
      </Link>
      <Link to={"/"}>
        <span className="hover:cursor-pointer hover:text-zinc-900 hover:underline">
          {category}
        </span>
        {subCategory && " > "}
      </Link>
      <Link to={"/"}>
        <span className="hover:cursor-pointer hover:text-zinc-900 hover:underline">
          {subCategory}
        </span>
      </Link>
    </div>
  );
};

export default Navigation;
