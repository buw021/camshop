import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <ToastContainer
      position="bottom-right"
      autoClose={false}
      newestOnTop={true}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={true}
      draggable={true}
      theme="light"
      transition={Bounce}
    ></ToastContainer>
  </React.StrictMode>,
);
