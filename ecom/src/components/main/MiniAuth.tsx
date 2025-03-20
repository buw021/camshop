import { useState } from "react";
import Register from "../../pages/Main/Register";
import LogIn from "../../pages/Main/Login";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  "opacity-0": {
    opacity: 0,
    transition: { type: "spring", duration: 0.5 },
  },
  "opacity-1": {
    opacity: 1,
    transition: { type: "spring", duration: 0.5 },
  },
};

const MiniAuth = () => {
  const [registerModal, setRegisterModal] = useState(false);
  const [loginModal, setLoginModal] = useState(false);

  const handleRegisterButton = () => {
    setRegisterModal(true);
  };

  const handleLoginButton = () => {
    setLoginModal(true);
  };

  const toggleCloseRegister = () => {
    //if registered successfully close registermodal
    setRegisterModal(false);
  };

  const toggleCloseLogin = () => {
    setLoginModal(false);
  };

  return (
    <>
      {registerModal && (
        <>
          <AnimatePresence>
            <motion.div
              className="absolute left-0 top-0 z-50 backdrop-blur-[2px]"
              variants={variants}
              initial="opacity-0"
              animate="opacity-1"
              exit="opacity-0"
            >
              <span
                className={`material-symbols-outlined absolute right-5 top-5 z-50 text-white transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-300 ${
                  registerModal
                    ? ""
                    : "invisible rotate-180 -scale-100 opacity-0"
                }`}
                onClick={toggleCloseRegister}
              >
                close
              </span>
              <Register onSuccess={toggleCloseRegister} />
            </motion.div>
          </AnimatePresence>
        </>
      )}
      {loginModal && (
        <>
          <AnimatePresence>
            <motion.div
              className="b absolute left-0 top-0 z-50 backdrop-blur-[2px]"
              variants={variants}
              initial="opacity-0"
              animate="opacity-1"
              exit="scale-0"
            >
              <span
                className={`material-symbols-outlined absolute right-5 top-5 z-50 text-white transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-300 ${loginModal ? "" : "invisible rotate-180 -scale-100 opacity-0"}`}
                onClick={toggleCloseLogin}
              >
                close
              </span>
              <LogIn />
            </motion.div>
          </AnimatePresence>
        </>
      )}
      <div className="flex flex-col justify-center">
        <div className="roboto-medium mb-2 flex justify-center self-center text-2xl text-zinc-800">
          Login/Register
        </div>
        <div className="flex h-auto w-full flex-col items-center">
          <button
            className="roboto-medium w-full rounded-full bg-zinc-900 py-2 text-lg text-white transition-all duration-200 hover:bg-zinc-700 md:max-w-[300px]"
            onClick={handleLoginButton}
          >
            Log in
          </button>
          <div className="relative my-8 hidden h-[1px] w-full items-center justify-center bg-zinc-200 md:my-6 md:max-w-[300px]">
            <span className="roboto-regular absolute bg-white p-2 text-[12px] text-zinc-500">
              Already have an account?
            </span>
          </div>
        </div>
        <div className="flex h-auto w-full flex-col items-center">
          <div className="relative my-8 flex w-full items-center justify-between md:my-6 md:max-w-[300px]">
            <span className="h-[1px] w-[50%] bg-zinc-200"></span>
            <span className="roboto-regular w-full bg-transparent p-2 text-center text-[12px] text-zinc-700">
              Don't have an account ?
            </span>
            <span className="h-[1px] w-[50%] bg-zinc-200"></span>
          </div>
          <div className="flex h-auto w-full flex-col items-center gap-2">
            <button className="roboto-medium w-full rounded-full bg-zinc-200 py-2 text-lg text-zinc-900 transition-all duration-200 hover:bg-zinc-300 md:max-w-[300px]">
              Continue with Google
            </button>
            <button
              className="roboto-medium w-full rounded-full bg-zinc-900 py-2 text-lg text-white transition-all duration-200 hover:bg-zinc-700 md:max-w-[300px]"
              onClick={handleRegisterButton}
            >
              Register by e-mail
            </button>
          </div>
          <div className="relative my-8 flex w-full items-center justify-center md:my-6 md:max-w-[300px]">
            <span className="roboto-regular absolute bg-transparent p-2 text-center text-[11px] text-zinc-500">
              By logging in with my social media account, I agree to link the
              account in accordance with the{" "}
              <span className="underline hover:cursor-pointer">
                Privacy Policy
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MiniAuth;
