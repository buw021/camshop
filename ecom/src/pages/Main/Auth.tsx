import { useState, useEffect } from "react";
import SignUp from "./Register";
import SignIn from "./Login";

const Auth = () => {
  //condition here if already signedIn!

  const [path, setPath] = useState("signin");
  useEffect(() => {
    setPath((currentPath) => (currentPath === "signin" ? "signup" : "signin"));
  }, []);
  const changePath = () => {
    setPath((currentPath) => (currentPath === "signin" ? "signup" : "signin"));
  };
  return (
    <section className="flex h-screen w-screen justify-center items-center bg-none relative select-none">
      <div className="relative bg-white md:max-w-2xl w-full h-full md:h-[700px]  rounded-2xl flex flex-col items-center md:flex-col px-10 justify-center gap-1 ">
        {path === "signin" && <SignIn />}
        {path === "signup" && <SignUp onSuccess={function (): void {
          throw new Error("Function not implemented.");
        } } />}
        <div>
          <a
            className="text-[12px] text-slate-500 roboto-regular hover:cursor-pointer hover:text-blue-500 hover:underline"
            onClick={() => changePath()}
          >
            {path === "signin" && "Don't have an Account?"}
            {path === "signup" && "Aldeady have an Account?"}
          </a>
        </div>
      </div>
    </section>
  );
};

export default Auth;
