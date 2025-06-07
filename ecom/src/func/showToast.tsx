import { toast, Bounce } from "react-toastify";

export const showToast = (
  message: string,
  type: "error" | "success" | "warning" | "info",
) => {
  toast[type](<div dangerouslySetInnerHTML={{ __html: message }}></div>, {
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
};
