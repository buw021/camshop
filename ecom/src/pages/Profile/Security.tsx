import React, { useEffect, useState } from "react";
import { User } from "../../interfaces/user";
import { Link } from "react-router-dom";
import { ChangePassword } from "./Change";
import { Loading } from "../../components/main/Loading";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../services/axiosInstance";

const Security: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<User | null>(null);
  const [toggleChangeEmail, setToggleChangeEmail] = useState(false);
  const [toggleChangePass, setToggleChangePass] = useState(false);

  const getUser = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      setData(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  const toggleClose = () => {
    setToggleChangeEmail(!toggleChangeEmail);
    setToggleChangePass(!toggleChangePass);
  };

  if (!data) return <Loading></Loading>;
  return (
    <div className={`flex h-full w-full flex-col gap-2`}>
      <div className="relative mb-2 flex items-center justify-between border-b-[1px]">
        {toggleChangePass && (
          <ChangePassword
            token={token}
            toggleClose={toggleClose}
          ></ChangePassword>
        )}
        <div className="flex gap-2">
          <Link to={"/my-profile"}>
            <p
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-lg hover:cursor-pointer hover:bg-zinc-200 ${window.location.pathname === "/my-profile" && "border-zinc-300 bg-zinc-200"}`}
            >
              My Profile
            </p>
          </Link>
          <Link to={"/security"}>
            <p
              className={`roboto-medium rounded-t border-x-[1px] border-t-[1px] border-zinc-100 bg-zinc-100 px-2 text-lg hover:cursor-pointer hover:bg-zinc-200 ${window.location.pathname === "/security" && "border-zinc-300 bg-zinc-200"}`}
            >
              Security
            </p>
          </Link>
        </div>
      </div>
      <div className="flex max-w-xl flex-col divide-y-2 rounded border-[1px] text-sm leading-3">
        <button
          className="flex w-full items-center justify-between px-2 py-1 text-left hover:bg-zinc-100"
          onClick={() => setToggleChangeEmail(!toggleChangeEmail)}
        >
          <span>Change Email Address</span>
          <span
            className={`item-center material-symbols-outlined filled bg-none text-sm`}
          >
            arrow_forward_ios
          </span>
        </button>
        <button
          className="flex w-full items-center justify-between px-2 py-1 text-left hover:bg-zinc-100"
          onClick={() => setToggleChangePass(!toggleChangePass)}
        >
          <span>Change Password</span>
          <span
            className={`item-center material-symbols-outlined filled bg-none text-sm`}
          >
            arrow_forward_ios
          </span>
        </button>
      </div>
    </div>
  );
};

export default Security;
