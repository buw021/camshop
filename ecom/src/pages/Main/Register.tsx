import React, { useEffect, useState } from "react";
import InputField from "../../components/account/AuthInputField";
import { motion, AnimatePresence } from "framer-motion";
import useDebounce from "../../func/debouncer";
import { evaluatePasswordStrength } from "../../func/passEvaluation";
import axios from "axios";
import axiosInstance from "../../services/axiosInstance";
import { showToast } from "../../func/showToast";

interface Register {
  onSuccess: () => void;
}

const Register: React.FC<Register> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(["", "", ""]);
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [emailStatus, setEmailStatus] = useState<boolean | null>(null);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);

  const debouncedEmail = useDebounce(email, 500);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    evaluatePasswordStrength(newPassword, setPasswordStrength);
    if (confirmPassword) {
      setIsPasswordMatch(newPassword === confirmPassword);
    }
  };

  const checkEmailExists = async (email: string) => {
    try {
      const response = await axiosInstance.get(`/check-email?email=${email}`); // Log the response to see it
      setEmailExists(response.data.exists);
    } catch (error: unknown) {
      console.error("Error checking email:", error);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailStatus(null);
    setEmailExists(null);
    setEmail(e.target.value);
  };

  useEffect(() => {
    // Only perform the email validation if the user has stopped typing
    if (debouncedEmail) {
      const isValidEmail =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(
          debouncedEmail,
        );
      setEmailStatus(isValidEmail);

      if (isValidEmail) {
        checkEmailExists(debouncedEmail);
      } else {
        setEmailExists(null);
      }
    }
  }, [debouncedEmail]);
  // Run the effect when debouncedEmail changes
  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setIsPasswordMatch(newConfirmPassword === password);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = { email, password };
    try {
      const response = await axiosInstance.post("/register", data);
      if (response.data.error) {
        showToast(response.data.error, "error");
      } else {
        showToast(
          "Successfully Registered!\nPlease confirm your email.",
          "success",
        );
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        onSuccess();
      }
    } catch (error) {
      handleAxiosError(error);
    }
  };

  const handleAxiosError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        showToast(`Error response: ${error.response.data}`, "error");
      } else if (error.request) {
        showToast("Error request: No response received", "error");
      } else {
        showToast(`Error message: ${error.message}`, "error");
      }
    } else {
      showToast(`Unknown error: ${error}`, "error");
    }
  };

  const variants = {
    "scale-0": {
      scale: 0,
      opacity: 0,
      transition: { type: "spring", duration: 0.25 },
    },
    "scale-1": {
      scale: 1,
      opacity: 1,
      transition: { type: "spring", duration: 0.25 },
    },
    "opacity-0": {
      opacity: 0,
      transition: { type: "spring", duration: 0.25 },
    },
    "opacity-1": {
      opacity: 1,
      transition: { type: "spring", duration: 0.25 },
    },
  };

  interface StatusIconProps {
    isValid: boolean | null;
  }

  const renderStatusIcon = ({ isValid }: StatusIconProps) => {
    if (isValid === null) {
      return;
    }
    const iconClass = isValid ? "text-green-700" : "text-red-700";
    const iconName = isValid ? "check" : "block";

    return (
      <motion.span
        key={isValid ? "password-matched" : "password-not-matched"}
        className={`material-symbols-outlined text-sm ${iconClass}`}
        variants={variants}
        initial="scale-0"
        animate="scale-1"
        exit={isValid ? {} : { opacity: 0 }}
      >
        {iconName}
      </motion.span>
    );
  };

  return (
    <section className="relative flex h-screen w-screen select-none items-center justify-center bg-zinc-900/60 backdrop-blur-[2px]">
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
            Register
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
                label="Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                addError={
                  email !== "" && emailStatus === false && emailExists === true
                }
              />
              <div className="absolute right-3 flex items-center">
                {debouncedEmail == "" ? (
                  <motion.span
                    key="no-email"
                    className="material-symbols-outlined text-[10px] text-red-700"
                    variants={variants}
                    initial="scale-0"
                    animate="scale-1"
                  >
                    emergency
                  </motion.span>
                ) : (
                  renderStatusIcon({ isValid: emailStatus })
                )}
              </div>
            </div>
            <AnimatePresence>
              {debouncedEmail !== "" && emailStatus === false && (
                <motion.div
                  className={`roboto-medium relative mb-[-10px] mt-[-10px] flex w-full flex-row items-center gap-1 px-1`}
                  variants={variants}
                  initial="opacity-0"
                  animate="opacity-1"
                  exit="opacity-0"
                >
                  <span className="material-symbols-outlined self-start text-sm text-red-700">
                    error
                  </span>
                  <span className="text-pretty text-xs text-red-700">
                    Please enter a valid email
                  </span>
                </motion.div>
              )}

              {debouncedEmail !== "" && emailExists === true && (
                <motion.div
                  className={`roboto-medium relative mb-[-10px] mt-[-10px] flex w-full flex-row items-center gap-1 px-1`}
                  variants={variants}
                  initial="opacity-0"
                  animate="opacity-1"
                  exit="opacity-0"
                >
                  <span className="material-symbols-outlined self-start text-sm text-red-700">
                    error
                  </span>
                  <span className="text-pretty text-xs text-red-700">
                    Email is already in used
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative flex w-full flex-row items-center gap-1">
              <InputField
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                addError={false}
              />
              <div className="absolute right-3 flex items-center">
                {(password || confirmPassword) && (
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
                )}
                {password == "" && confirmPassword == "" && (
                  <>
                    <motion.span
                      key="no-password"
                      className="material-symbols-outlined text-[10px] text-red-700"
                      variants={variants}
                      initial="scale-0"
                      animate="scale-1"
                    >
                      emergency
                    </motion.span>
                  </>
                )}
              </div>
            </div>
            <div className="relative flex w-full flex-row items-center gap-1">
              <InputField
                id="confirmPassword"
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                addError={false}
              />

              <div className="t absolute right-3 flex items-center">
                {(password || confirmPassword) && (
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
                )}
                {password == "" && confirmPassword == "" && (
                  <>
                    <motion.span
                      key="no-password"
                      className="material-symbols-outlined text-[10px] text-red-700"
                      variants={variants}
                      initial="scale-0"
                      animate="scale-1"
                    >
                      emergency
                    </motion.span>
                  </>
                )}
              </div>
            </div>
            {(passwordStrength[1] === "Weak" ||
              passwordStrength[1] === "Moderate" ||
              passwordStrength[1] === "") &&
              password !== "" && (
                <div className="roboto-medium relative mt-[-10px] flex w-full flex-row items-center gap-1 px-1">
                  <span className="text-pretty text-xs text-red-700">
                    <span className="text-red-900 underline">Password</span>{" "}
                    must be at least{" "}
                    <span className="text-red-900 underline">8</span> characters
                    long and include at least one lowercase letter, one
                    uppercase letter, one number, and one special character.
                  </span>
                </div>
              )}
            <AnimatePresence>
              {!isPasswordMatch &&
                password !== "" &&
                confirmPassword !== "" && (
                  <motion.div
                    className={`roboto-medium relative mb-[-10px] mt-[-10px] flex w-full flex-row items-center gap-1 px-1`}
                    variants={variants}
                    initial="opacity-0"
                    animate="opacity-1"
                    exit="opacity-0"
                  >
                    <span className="material-symbols-outlined self-start text-sm text-red-700">
                      error
                    </span>
                    <span className="text-pretty text-xs text-red-700">
                      Password do not match
                    </span>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* for error list 
            <div className="flex flex-row justify-start items-center gap-1 w-full relative roboto-medium text-orange-800">
              <span className="material-symbols-outlined text-sm ">
                arrow_right
              </span>
              <p className="text-xs"></p>
            </div>*/}

            {/* terms and conditions and Privacy policy
            <div className="flex flex-row relative w-full gap-1 mb-2">
              <input
                type="checkbox"
                name="termsAndPolicy"
                id="termsAndPolicy"
                className="w-3 h-3 flex m-[0.20rem] text-black text-red hover:cursor-pointer"
                style={{ accentColor: "gray" }}
              />
              <label
                htmlFor="termsAndPolicy"
                className="roboto-regular text-[12px] text-gray-500"
              >
                I have read and agree to the _ Account Terms of services and _
                Account Privacy Policy
              </label>
            </div>
            */}

            <div
              className={`${
                !password ? "hidden" : ""
              } text-gree relative mt-[-10px] flex w-full flex-row items-center justify-between gap-3 px-1`}
            >
              <div
                className={`relative mt-[2px] h-1 w-[100%] rounded-full bg-gray-300`}
              >
                {" "}
                <motion.div
                  className={`h-1 ${passwordStrength[3]} relative rounded-full transition`}
                  animate={{ width: passwordStrength[2] }}
                  initial={{ width: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                ></motion.div>
              </div>
              <span
                className={`${passwordStrength[0]} roboto-medium text-nowrap text-xs`}
              >
                {passwordStrength[1]}
              </span>
            </div>

            <button
              disabled={
                !email ||
                !password ||
                !confirmPassword ||
                !isPasswordMatch ||
                !emailStatus ||
                emailExists ||
                passwordStrength[1] === "Weak" ||
                password.length < 8
              }
              type="submit"
              className="text-md w-full rounded-md bg-zinc-500 px-8 py-2 font-medium text-white/90 transition duration-150 ease-in hover:bg-zinc-700 hover:shadow-lg focus:bg-zinc-900 focus:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
            >
              Register
            </button>
          </div>
        </form>
        {/*<div>
          <Link
            to="/login"
            className="text-[12px] text-slate-500 roboto-regular hover:cursor-pointer hover:text-blue-500 hover:underline"
          >
            Aldeady have an Account?
          </Link>
        </div>*/}
      </div>
    </section>
  );
};

export default Register;
