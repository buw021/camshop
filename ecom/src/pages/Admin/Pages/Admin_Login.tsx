import React, { useState } from "react";
import InputField from "../../../components/account/AuthInputField";
import axios from "axios";
import { toast, Bounce } from "react-toastify";

const Admin_Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  /*Authentication HERE!!!*/
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = {
      username: username,
      password: password,
      remeberMe: rememberMe,
    };
    try {
      setInvalid(false);
      const response = await axios.post("/admin_login", data);
      if (response.data.error) {
        setInvalid(true);
      } else {
        setInvalid(false);
        setUsername("");
        setPassword("");
        window.location.reload();
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Axios error
        if (error.response) {
          toast.error(`Error response: ${error.response.data}`, {
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
        } else if (error.request) {
          toast.error("No response received", {
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
        } else {
          toast.error(`${error.message}`, {
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
      } else {
        // Non-Axios error
        toast.error(`Unknown error: ${error}`, {
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
    }
  };

  const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="roboto-medium relative mb-[-10px] mt-[-10px] flex w-full flex-row items-center gap-1 px-1">
      <span className="material-symbols-outlined text-sm text-red-700">
        error
      </span>
      <span className="text-xs text-red-700">{message}</span>
    </div>
  );

  return (
    <section className="relative flex h-dvh w-dvw select-none items-center justify-center bg-zinc-900/60 backdrop-blur-[2px]">
      <div className="relative flex w-[80%] flex-col items-center justify-center gap-1 rounded-2xl bg-white px-10 py-10 md:h-[600px] md:w-[600px] md:flex-col">
        <div className="flex flex-col items-center gap-3">
          <div
            className={`roboto-medium relative transition-opacity duration-100 ease-linear md:mb-5`}
          >
            <span className={`text-5xl text-zinc-800 md:text-7xl`}>
              camshop
            </span>
            <span className="absolute bottom-6 right-6 text-4xl text-red-700 md:bottom-10 md:right-9 md:text-6xl">
              .
            </span>
          </div>
          <h1 className="roboto-medium -mb-2 text-center text-xl text-gray-900">
            Admin
          </h1>
          <p className="roboto-regular mt-3 text-pretty text-center text-sm text-gray-500 md:mt-0"></p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-[100%] flex-col items-center md:w-[50%]"
        >
          <div className="flex w-full max-w-96 flex-col items-center gap-4">
            <div className="relative flex w-full flex-row items-center gap-1">
              <InputField
                id="email"
                label="Username/Email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                addError={false}
              />
            </div>
            <div className="relative flex w-full flex-row items-center gap-1">
              <InputField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                addError={false}
              />
              {password && (
                <div className="absolute right-3 top-3">
                  <a
                    className="text-gray-300 transition-all duration-75 hover:cursor-pointer hover:text-gray-500"
                    onClick={() =>
                      showPassword
                        ? setShowPassword(false)
                        : setShowPassword(true)
                    }
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </a>
                </div>
              )}
            </div>

            {invalid && <ErrorMessage message="Invalid email or password" />}

            <div className="flex w-full flex-row items-center justify-between px-1">
              <div className="flex flex-row items-center justify-center gap-x-1">
                <input
                  type="checkbox"
                  name="rememberMe"
                  id="rememberMe"
                  className="text-red flex h-3 w-3 items-center justify-center text-black hover:cursor-pointer"
                  style={{ accentColor: "gray" }}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label
                  htmlFor="rememberMe"
                  className="roboto-regular text-[12px] text-gray-500 hover:cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <a className="roboto-regular text-[12px] text-zinc-500 hover:cursor-pointer hover:text-zinc-500 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              disabled={!username || !password || password.length <= 8}
              type="submit"
              className="text-md w-full rounded-md bg-zinc-500 px-8 py-2 font-medium text-white/90 transition duration-150 ease-in hover:bg-zinc-700 hover:shadow-lg focus:bg-zinc-900 focus:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              Log in
            </button>
          </div>
        </form>
        {/*<div>
          <Link
            to="/register"
            className="text-[12px] text-slate-500 roboto-regular hover:cursor-pointer hover:text-blue-500 hover:underline"
          >
            Don't have an Account?
          </Link>
        </div>*/}
      </div>
    </section>
  );
};

export default Admin_Login;
