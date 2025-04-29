import Product_List from "./Product_List";

interface categories {
  category: "camera" | "lens" | "accessories" | "other" | "all";
}

const Category: React.FC<categories> = ({ category }) => {
  return (
    <>
      <Product_List category={category} />
    </>
  );
};

export default Category;
