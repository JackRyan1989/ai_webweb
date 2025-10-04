const LeftRail = ({ children }) => {
    return (
        <aside className="fixed min-w-min max-w-[20%] min-h-screen max-h-[100%] col-span-2 dark:text-white dark:bg-black dark:border-white bg-white border-r-2 border-black overflow-scroll">
            {children}
        </aside>
    );
};

export default LeftRail;
