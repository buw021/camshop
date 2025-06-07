import ProductCarousel from "../../components/main/ProductCarousel";
import ImgCarousel from "../../components/main/ImgCarousel";

const Home = () => {
  return (
    <div>
      <div className="flex flex-col items-center gap-2 mt-2">
        <ImgCarousel imgs={[]}></ImgCarousel>
      </div>
      <div className="flex w-full flex-col items-center gap-2">
        <ProductCarousel></ProductCarousel>
        <ProductCarousel></ProductCarousel>
      </div>
    </div>
  );
};

export default Home;
