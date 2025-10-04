const LeftRail = ({ children }) => {
    return (
        <aside className="fixed max-w-min max-h-[100%] col-span-2 dark:text-white dark:bg-black dark:border-white bg-white border-r-2 border-black overflow-scroll">
            {children}
        </aside>
    );
};

export default LeftRail;
