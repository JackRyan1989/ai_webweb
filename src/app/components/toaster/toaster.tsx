import { ToastContainer, Slide } from "react-toastify";

export default function Toaster() {
    return (
        <ToastContainer
            position="bottom-center"
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Slide}
        />
    );
}
