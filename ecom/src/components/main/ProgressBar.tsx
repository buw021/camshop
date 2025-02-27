import React from "react";

interface ProgressBarProps {
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label }) => {
  /* enum: [
        "ordered",
        "paid",
        "pending",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "processed",
        "refund on process",
        "payment failed",
      ], */
  const statusSteps = [
    { label: "pending", value: 0 },
    { label: "paid", value: 1 },
    { label: "processed", value: 2 },
    { label: "shipped", value: 3 },
    { label: "delivered", value: 4 },
  ];

  const step = statusSteps.find((step) => step.label === label);

  return (
    <div className="flex w-full flex-col items-center justify-center  px-4 py-2.5">
      {step ? (
        <>
          <div className="flex w-full flex-row items-center justify-between">
            <div className="flex flex-col items-center gap-1">
              {label === "pending" ? (
                <>
                  <span
                    style={{ animationDuration: `3s` }}
                    className="material-symbols-outlined text-yellow-500 sm:text-[50px]"
                  >
                    credit_card_clock
                  </span>
                  <span className="text-xs leading-3 tracking-normal text-yellow-600">
                    Pending
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={`material-symbols-outlined sm:text-[50px] ${label === "paid" || (step && step.value >= 1) ? "text-zinc-700" : "text-zinc-200"}`}
                  >
                    credit_score
                  </span>
                  <span
                    className={`text-xs leading-3 tracking-normal ${label === "paid" || (step && step.value >= 1) ? "text-zinc-700" : "text-zinc-200"}`}
                  >
                    Paid
                  </span>
                </>
              )}
            </div>
            <div className="flex w-20 flex-col items-center justify-center sm:w-32">
              <div className="w-[90%]">
                <div className="relative pt-4 sm:pt-1">
                  <div className="mb-4 flex h-1 w-auto overflow-hidden rounded bg-zinc-200 text-xs sm:h-2">
                    <div
                      className={`flex flex-col justify-center whitespace-nowrap bg-zinc-700 text-center text-white shadow-none ${step.value === 1 ? "w-[15%]" : step.value > 1 ? "w-full" : "w-0"}`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span
                className={`material-symbols-outlined sm:text-[50px] ${label === "processed" || (step && step.value >= 2) ? "text-zinc-700" : "text-zinc-200"}`}
              >
                list_alt_check
              </span>
              <span
                className={`text-xs leading-3 tracking-normal ${label === "processed" || (step && step.value >= 2) ? "text-zinc-700" : "text-zinc-200"}`}
              >
                Processed
              </span>
            </div>
            <div className="flex w-20 flex-col items-center justify-center sm:w-32">
              <div className="w-[90%]">
                <div className="relative pt-4 sm:pt-1">
                  <div className="mb-4 flex h-1 w-auto overflow-hidden rounded bg-zinc-200 text-xs sm:h-2">
                    <div
                      className={`flex flex-col justify-center whitespace-nowrap bg-zinc-700 text-center text-white shadow-none ${step.value === 2 ? "w-1/2" : step.value > 2 ? "w-full" : "w-0"}`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span
                className={`material-symbols-outlined relative sm:text-[50px] ${label === "shipped" || (step && step.value >= 3) ? "text-zinc-700" : "text-zinc-200"}`}
              >
                local_shipping
                {/*  <span
                  className={`material-symbols-outlined absolute -bottom-[1px] -right-1 rounded-full bg-white text-[15px] sm:bottom-0 sm:text-[25px] ${label === "delivered" ? "text-zinc-700" : "text-zinc-200"}`}
                >
                  check
                </span> */}
              </span>

              <span
                className={`text-xs leading-3 tracking-normal ${label === "shipped" || (step && step.value >= 3) ? "text-zinc-700" : "text-zinc-200"}`}
              >
                Shipped
              </span>
            </div>
            <div className="flex w-20 flex-col items-center justify-center sm:w-32">
              <div className="w-[90%]">
                <div className="relative pt-4 sm:pt-1">
                  <div className="mb-4 flex h-1 w-auto overflow-hidden rounded bg-zinc-200 text-xs sm:h-2">
                    <div
                      className={`flex flex-col justify-center whitespace-nowrap bg-zinc-700 text-center text-white shadow-none ${step.value === 3 ? "w-1/5" : step.value === 4 ? "w-full" : "w-0"}`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span
                className={`material-symbols-outlined relative sm:text-[50px] ${label === "delivered" ? "text-zinc-700" : "text-zinc-200"}`}
              >
                box
                {/*  <span
                  className={`material-symbols-outlined absolute -bottom-[1px] -right-1 rounded-full bg-white text-[15px] sm:bottom-0 sm:text-[25px] ${label === "delivered" ? "text-zinc-700" : "text-zinc-200"}`}
                >
                  check
                </span> */}
              </span>
              <span
                className={`text-xs leading-3 tracking-normal ${label === "delivered" ? "text-zinc-700" : "text-zinc-200"}`}
              >
                Delivered
              </span>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ProgressBar;
