import { Link } from "react-router-dom";
import { slugify } from "../func/slugify";

export const ProductCard: React.FC<{
  id?: string;
  name: string;
  variantId?: string;
  price: number | null;
  brand: string;
  thumbnail: string;
  color: string;
  variantName: string;
}> = ({ id, name, variantId, price, brand, thumbnail, color, variantName }) => {
  const productSlug = slugify(name);
  return (
    <div className="flex flex-col gap-4">
      <Link to={`/product/${productSlug}_${id}_${variantId}`}>
        <div className="relative flex h-40 select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner sm:h-80">
          <div className="absolute z-10 h-full w-full hover:cursor-pointer hover:bg-black/10"></div>
          <div className="absolute h-full w-full bg-zinc-500/5"></div>
          <img
            className="h-full object-scale-down px-4 py-4"
            src={`http://localhost:3000/uploads/${thumbnail}`}
          ></img>
        </div>
      </Link>
      <div className="flex flex-col gap-2">
        <Link to={`/product/${productSlug}_${id}_${variantId}`}>
          <h1 className="roboto-medium text-sm hover:underline">
            {name} {variantName} {color}
          </h1>
        </Link>
        <p className="text-xs text-zinc-700">{brand}</p>
        <p className="roboto-bold text-sm leading-3">
          € <span>{price}</span>
        </p>
      </div>
    </div>
  );
};

export const CardLoadingSkeleton = () => (
  <div className="flex animate-pulse flex-col gap-4">
    <div className="relative h-40 w-full select-none overflow-hidden rounded-xl border-zinc-500 bg-gray-200 shadow-inner sm:h-80"></div>
    <div className="flex flex-col gap-2">
      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
      <div className="h-3 w-1/2 rounded bg-gray-200"></div>
      <div className="h-4 w-1/4 rounded bg-gray-200"></div>
    </div>
  </div>
);
