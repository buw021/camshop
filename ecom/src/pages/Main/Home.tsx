import Product_List from "./Product_List";

const Home = () => {
  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        <div className="big-banner h-72 w-full bg-zinc-500"></div>
      </div>
      <Product_List category="all" />
    </div>
  );
};

export default Home;
