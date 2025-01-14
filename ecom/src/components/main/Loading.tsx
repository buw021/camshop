export const Loading = () => (
  <div className="fixed left-0 top-0 z-[100] flex h-screen w-screen items-center justify-center bg-white">
    <div
      className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-zinc-900 motion-reduce:animate-[spin_1.5s_linear_infinite]"
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  </div>
);

export const ProductLoading = () => (
  <div className="flex animate-pulse flex-col gap-10">
    <div className="relative h-[50vh] w-full select-none overflow-hidden rounded border-zinc-500 bg-gray-200 shadow-inner sm:h-[500px]"></div>
  </div>
);

export const ImageLoading = () => (
  <div className="flex animate-pulse flex-col gap-10 px-20">
    <div className="relative h-96 w-[550px] select-none overflow-hidden rounded border-zinc-500 bg-gray-200 shadow-inner"></div>
  </div>
);
