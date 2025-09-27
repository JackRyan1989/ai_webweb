import { toast, Slide } from "react-toastify";

const toastEmitter = (message: string, type: "info" | "success" | "error", duration = 1000) => {
    toast[type](message, {
        position: "bottom-center",
        autoClose: duration,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
    });
};

export default toastEmitter;
