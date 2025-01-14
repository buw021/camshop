import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="mt-20 flex h-screen w-screen flex-col items-center gap-1 text-lg leading-3">
      <h1>
        <span className="roboto-bold">404</span> - Page Not Found
      </h1>
      <p className="text-xs">The page you are looking for does not exist.</p>
      <span className="mt-1 rounded bg-zinc-900 px-2 py-2 text-white hover:cursor-pointer hover:bg-zinc-700">
        <Link to="/">
          Go back to <span className="">Home</span>
        </Link>
      </span>
      <div className={`roboto-medium relative mt-1`}>
        <span className={`text-3xl text-zinc-800`}>camshop</span>
        <span className="absolute bottom-4 right-4 text-2xl text-red-700">
          .
        </span>
      </div>
    </div>
  );
};

export default NotFound;
