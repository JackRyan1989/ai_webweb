const MainContent = ({ children }: {[key: string]: React.ReactNode}) => {
    return (
        <div className="col-start-4 col-end-12">
            {children}
        </div>
    )
}

export default MainContent
