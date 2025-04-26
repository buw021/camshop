import { Link } from "react-router-dom";
import { slugify } from "../../func/slugify";

export const ProductCard: React.FC<{
  id?: string;
  name: string;
  variantId?: string;
  price: number | null;
  salePrice: number | null;
  brand: string;
  thumbnail: string;
  color: string;
  variantName: string;
}> = ({
  id,
  name,
  variantId,
  price,
  brand,
  thumbnail,
  color,
  variantName,
  salePrice,
}) => {
  const productSlug = slugify(name);
  return (
    <div className="flex flex-col gap-4">
      <Link
        to={`/product/${productSlug}_${id}_${variantId}`}
        onClick={(e) => {
          e.preventDefault();

          window.open(`/product/${productSlug}_${id}_${variantId}`, "_blank");
        }}
      >
        <div className="relative flex h-44   select-none flex-col justify-center overflow-hidden rounded-xl border-zinc-500 shadow-inner sm:h-44 md:h-60">
          <div className="absolute z-10 h-full w-full hover:cursor-pointer hover:bg-black/10"></div>
          <div className="absolute h-full w-full bg-zinc-500/5"></div>
          <img
            className="h-full object-scale-down px-4 py-4"
            src={`http://localhost:3000/uploads/${thumbnail}`}
          ></img>
        </div>
      </Link>
      <div className="flex flex-col gap-2">
        <Link
          to={`/product/${productSlug}_${id}_${variantId}`}
          onClick={(e) => {
            e.preventDefault();

            window.open(`/product/${productSlug}_${id}_${variantId}`, "_blank");
          }}
        >
          <h1 className="roboto-medium truncate text-sm hover:underline">
            {name} {variantName} {color}
          </h1>
        </Link>
        <p className="text-xs text-zinc-700">{brand}</p>
        <div className="roboto-bold text-sm leading-3">
          {salePrice ? (
            <div className="relative flex gap-1">
              <span>€{salePrice}</span>
              <span className="text-[10px] text-zinc-500 line-through">
                €{price}
              </span>
              <span className="bg-red-700 px-0.5 text-[8px] text-white">
                SALE
              </span>
            </div>
          ) : (
            <>
              € <span>{price}</span>
            </>
          )}
        </div>
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
