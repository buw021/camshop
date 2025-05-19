import React, { ReactNode, useState } from "react";


interface Variant {
  variantName: string;
  variantColor: string;
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
  open: boolean;
}> = ({ title, children, open }) => {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <div className="accordion-section mb-2">
      <div
        className="accordion-header flex cursor-pointer justify-between bg-gray-200 p-2 leading-3"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <div className="relative flex items-center">
          <span
            className={`material-symbols-outlined absolute right-0 ${!isOpen ? "animate-fade-in" : "animate-fade-out"}`}
          >
            collapse_content
          </span>
          <span
            className={`material-symbols-outlined absolute right-0 ${isOpen ? "animate-fade-in" : "animate-fade-out"}`}
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
  product: Product;
  togglePreview: () => void;
  confirm: () => void;
  processing: boolean;
  uploadProgress: number;
}> = ({ product, togglePreview, confirm, processing, uploadProgress }) => {
  return (
    <div className="absolute left-0 top-0 z-30 flex h-full w-full justify-center rounded bg-zinc-600/50 p-2.5 text-sm tracking-wide backdrop-blur-sm lg:p-10">
      {uploadProgress > 0 && (
        <div className="absolute left-0 top-0 z-40 flex h-full w-full flex-col items-center justify-center bg-zinc-500/30 backdrop-blur-sm">
          <p className="tracking wide w-full text-center text-sm font-medium leading-3 text-gray-700">
            Uploading Images
          </p>
          <div className="relative mt-2 flex h-5 w-40 overflow-hidden rounded-full border-[1px] border-zinc-400 bg-zinc-200">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p className="tracking wide absolute w-full text-center text-sm font-medium text-gray-700">
              {uploadProgress}%
            </p>
          </div>
        </div>
      )}
      <div className="container relative flex h-full w-full flex-col gap-4 overflow-scroll rounded-md bg-zinc-100 p-2.5 px-10">
        <span
          className={`material-symbols-outlined absolute right-2 top-2 z-20 h-8 w-8 select-none self-end rounded-full bg-zinc-900/10 text-center text-xl leading-8 text-zinc-800 backdrop-blur-sm transition-all duration-100 ease-linear hover:cursor-pointer hover:text-zinc-500`}
          onClick={() => togglePreview()}
        >
          close
        </span>
        <h1 className="mt-2 text-xl font-bold tracking-wide">
          Product Details
        </h1>
        <div>
          <div className="product-accordion rounded-md bg-white p-4 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">{product.name}</h2>
            <AccordionSection title="General Information" open={true}>
              <p>
                <strong>Category:</strong>{" "}
                <span className="capitalize">{product.category}</span>
              </p>
              <p>
                <strong>SubCategory:</strong>{" "}
                <span className="capitalize">{product.subCategory}</span>
              </p>
              <p>
                <strong>Brand:</strong>{" "}
                <span className="capitalize">{product.brand}</span>
              </p>
              <p>
                <strong>Description:</strong> {product.description}
              </p>
              {product.variants.length === 1 && (
                <>
                  <p>
                    <strong>Content:</strong>
                    {product.variants[0].variantContent}
                  </p>
                  <div className="h-[2px] w-full bg-zinc-200"></div>
                  <p>
                    <strong>Stocks:</strong> {product.variants[0].variantStocks}
                  </p>
                  <p>
                    <strong>Price:</strong> {product.variants[0].variantPrice}
                  </p>
                </>
              )}
            </AccordionSection>
            <AccordionSection title="Specifications" open={true}>
              {Object.entries(product.specifications).map(
                ([key, value], idx) => (
                  <div key={idx}>
                    <p>
                      <strong>{key}:</strong> {value}
                    </p>
                  </div>
                ),
              )}
            </AccordionSection>
            {product.variants.length > 1 && (
              <AccordionSection title="Variants" open={true}>
                <div className="flex flex-col divide-y-2 divide-zinc-200">
                  {product.variants.map((variant, idx) => (
                    <div key={idx}>
                      <p>
                        <strong>Name:</strong> {variant.variantName}
                      </p>
                      <p>
                        <strong>Color:</strong> {variant.variantColor}
                      </p>
                      <p>
                        <strong>Stocks:</strong> {variant.variantStocks}
                      </p>
                      <p>
                        <strong>Price:</strong> {variant.variantPrice}
                      </p>
                      <p>
                        <strong>Content:</strong>
                        {variant.variantContent.join(", ")}
                      </p>
                      <p>
                        <strong>Images:</strong>
                      </p>
                      <div className="flex flex-col gap-2">
                        {variant.variantImgs.length > 0 && "Old Images"}
                        <div className="flex gap-2">
                          {variant.variantImgs.map((url, index) => (
                            <div
                              key={index}
                              className="relative max-h-14 max-w-14 rounded bg-white p-1"
                            >
                              <img
                                src={url}
                                alt={`Preview ${url}`}
                                className="h-auto w-full"
                              />
                            </div>
                          ))}
                        </div>
                        {variant.previewUrl.length > 0 &&
                          "New Images to be added"}
                        <div className="flex gap-2">
                          {variant.previewUrl.map((img) => (
                            <div
                              key={img}
                              className="relative max-h-14 max-w-14 rounded bg-white p-1"
                            >
                              <img
                                src={img}
                                alt={`Preview ${img}`}
                                className="h-auto w-full"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionSection>
            )}
            {product.variants.length === 1 && (
              <AccordionSection title="Images" open={false}>
                <div className="flex flex-col gap-2">
                  Old Images
                  <div className="flex gap-2">
                    {product.variants[0].variantImgs.map((url, index) => (
                      <div
                        key={index}
                        className="relative max-h-14 max-w-14 rounded bg-white p-1"
                      >
                        <img
                          src={url}
                          alt={`Preview ${url}`}
                          className="h-auto w-full"
                        />
                      </div>
                    ))}
                  </div>
                  {product.variants[0].previewUrl.length > 0 && "New Images"}
                  <div className="flex gap-2">
                    {product.variants[0].previewUrl.map((img) => (
                      <div
                        key={img}
                        className="relative max-h-14 max-w-14 rounded bg-white p-1"
                      >
                        <img
                          src={img}
                          alt={`Preview ${img}`}
                          className="h-auto w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionSection>
            )}
            {product.tags.length > 0 && (
              <AccordionSection title="Tags" open={true}>
                <p>{product.tags.join(", ")}</p>
              </AccordionSection>
            )}
          </div>
        </div>
        <button
          type="button"
          className="self-end rounded bg-zinc-500 px-2.5 py-1 text-white hover:bg-zinc-700 focus:bg-zinc-500 focus:ring-2 focus:ring-zinc-400 disabled:animate-pulse disabled:cursor-wait"
          onClick={confirm}
          disabled={processing}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default PreviewForm;
