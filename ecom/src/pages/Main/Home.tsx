import ProductCarousel from "../../components/main/ProductCarousel";
import ImgCarousel from "../Admin/Components/PromoBanners/ImgCarousel";

const Home = () => {
  return (
    <div>
      <div className="flex flex-col items-center gap-2">
        <ImgCarousel imgs={[]}></ImgCarousel>
      </div>
      <ProductCarousel></ProductCarousel>
    </div>
  );
};

export default Home;
