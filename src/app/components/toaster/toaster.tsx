import { ToastContainer, Slide } from "react-toastify";

export default function Toaster() {
    return (
        <ToastContainer
            position="bottom-center"
            autoClose={1000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Slide}
        />
    );
}
