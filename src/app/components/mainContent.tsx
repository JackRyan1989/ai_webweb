const MainContent = ({ children }: {[key: string]: React.ReactNode}) => {
    return (
        <div className="col-start-4 col-end-12 min-h-[100vh]">
            {children}
        </div>
    )
}

export default MainContent
