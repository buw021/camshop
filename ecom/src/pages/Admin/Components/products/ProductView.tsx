import React, { ReactNode, useState } from "react";
interface Variant {
  variantName: string;
  variantColor?: string;
  variantStocks: number | null;
  variantContent: string[];
  variantImgs: string[];
  selectedImgFiles?: File[];
  previewUrl: string[];
  variantPrice: number | null;
  _id?: string;
}

interface Product {
  name: string;
  category: string;
  subCategory: string;
  brand: string;
  description: string;
  specifications: { [key: string]: string };
  variants: Variant[];
  tags: string[];
  _id?: string;
}

const AccordionSection: React.FC<{
  title: string;
  children: ReactNode;
}> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="accordion-section mb-2">
      <div
        className="accordion-header flex cursor-pointer justify-between rounded-md bg-zinc-100 p-2 leading-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium tracking-wide">{title}</span>
        <div className="relative flex items-center">
          <span
            className={`material-symbols-outlined absolute right-0 ${
              !isOpen ? "animate-fade-in" : "animate-fade-out"
            }`}
          >
            collapse_content
          </span>
          <span
            className={`material-symbols-outlined absolute right-0 ${
              isOpen ? "animate-fade-in" : "animate-fade-out"
            }`}
          >
            expand_content
          </span>
        </div>
      </div>
      {isOpen && (
        <div className="accordion-content flex flex-col gap-0.5 p-2">
          {children}
        </div>
      )}{" "}
    </div>
  );
};

const PreviewForm: React.FC<{
  product: Product | null;
  toggleClose: () => void;
}> = ({ product, toggleClose }) => {
  if (!product) {
    return <div>No product data available.</div>;
  }

  return (
    <div className="absolute left-0 top-0 z-30 flex h-full w-full justify-center rounded bg-zinc-600/50 p-2.5 text-sm tracking-wide backdrop-blur-sm lg:p-10">
      <div className="container relative flex h-full w-full flex-col gap-4 overflow-scroll rounded-md bg-zinc-100 p-2.5 px-10">
        <span
          className={`material-symbols-outlined absolute right-2 top-2 z-20 h-8 w-8 select-none self-end rounded-full bg-zinc-900/10 text-center text-xl leading-8 text-zinc-800 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
          onClick={toggleClose}
        >
          close
        </span>
        <h1 className="mt-2 text-xl font-bold tracking-wide">
          Product Details
        </h1>
        <div>
          <div className="product-accordion rounded-md bg-white p-4 text-sm shadow-md">
            <h2 className="mb-4 text-2xl font-bold">{product.name}</h2>
            <AccordionSection title="General Information">
              <p>
                <span className="font-medium">Category:</span>{" "}
                <span className="capitalize">{product.category}</span>
              </p>
              <p>
                <span className="font-medium">SubCategory:</span>{" "}
                <span className="capitalize">{product.subCategory}</span>
              </p>
              <p>
                <span className="font-medium">Brand:</span>{" "}
                <span className="capitalize">{product.brand}</span>
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {product.description}
              </p>
              {product.variants.length === 1 && (
                <>
                  <p>
                    <span className="font-medium">Content:</span>
                    {product.variants[0].variantContent.join(", ")}
                  </p>
                  <div className="h-[2px] w-full bg-zinc-200"></div>
                  <p>
                    <span className="font-medium">Stocks:</span>{" "}
                    {product.variants[0].variantStocks}
                  </p>
                  <p>
                    <span className="font-medium">Price:</span> €{" "}
                    {product.variants[0].variantPrice?.toFixed(2)}
                  </p>
                </>
              )}
            </AccordionSection>
            <AccordionSection title="Specifications">
              {product.specifications &&
              Object.keys(product.specifications).length > 0 ? (
                Object.entries(product.specifications).map(([key, value]) => (
                  <p key={key} className="text-sm">
                    <strong>{key}:</strong> {String(value)}
                  </p>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No specifications available.
                </p>
              )}
            </AccordionSection>
            {product.variants.length > 1 && (
              <AccordionSection title="Variants">
                <div className="flex flex-col divide-y-2 divide-zinc-200">
                  {product.variants.map((variant, idx) => (
                    <div key={idx}>
                      <p>
                        <strong>Name:</strong> {variant.variantName}
                      </p>
                      {variant.variantColor && (
                        <p>
                          <strong>Color:</strong> {variant.variantColor}
                        </p>
                      )}
                      <p>
                        <strong>Stocks:</strong> {variant.variantStocks}
                      </p>
                      <p>
                        <strong>Price:</strong> € {variant.variantPrice}
                      </p>
                      <p>
                        <strong>Content:</strong>
                        {variant.variantContent.join(", ")}
                      </p>
                      <p>
                        <strong>Images:</strong>
                      </p>
                      <div className="flex gap-2">
                        {variant.variantImgs.map((img) => (
                          <div
                            key={img}
                            className="relative max-h-14 max-w-14 rounded bg-white p-1"
                          >
                            <img
                              src={`http://localhost:3000/uploads/products/${img}`}
                              alt={`Preview ${img}`}
                              className="h-auto w-full"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}
            {product.variants.length === 1 && (
              <AccordionSection title="Images">
                <div className="flex gap-2">
                  {product.variants[0].variantImgs.map((img) => (
                    <div
                      key={img}
                      className="relative max-h-14 max-w-14 rounded bg-white p-1"
                    >
                      <img
                        src={`http://localhost:3000/uploads/products/${img}`}
                        alt={`Preview ${img}`}
                        className="h-auto w-full"
                      />
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}
            {product.tags.length > 0 && (
              <AccordionSection title="Tags">
                <p>{product.tags.join(", ")}</p>
              </AccordionSection>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewForm;
