import Link from "next/link";

interface HeaderProps {
    destination: string
    linkText: string
}

const Header = ({destination, linkText}: HeaderProps) => {
    return (
        <div className="flex flex-row my-3">
            <div className="text-center flex-12">
                <label htmlFor="oracleHole">Ai WebWeb</label>
                <p className="text-xs">
                    for to make conversation with the brains
                </p>
            </div>
            <Link
                className="flex-1/6 text-center py-2 underline decoration-1"
                href={destination}
            >
                {linkText}
            </Link>
        </div>
    );
};

export default Header;
