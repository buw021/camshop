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
    { label: "cancelled", value: 0 },
    { label: "ordered", value: 1 },
    { label: "processed", value: 2 },
    { label: "shipped", value: 3 },
    { label: "delivered", value: 4 },
  ];
  const step = statusSteps.find((step) => step.label === label);

  const refundSteps = [
    { label: "refund requested", value: 0 },
    { label: "refund on process", value: 1 },
    { label: "refunded", value: 2 },
  ];

  const refundStep = refundSteps.find((step) => step.label === label);

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-2.5">
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
                    pending
                  </span>
                  <span className="text-xs leading-3 tracking-normal text-yellow-600">
                    Pending
                  </span>
                </>
              ) : label === "cancelled" ? (
                <>
                  <span
                    className={`material-symbols-outlined text-red-700 sm:text-[50px]`}
                  >
                    block
                  </span>
                  <span
                    className={`text-xs leading-3 tracking-normal text-red-800`}
                  >
                    Cancelled
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={`material-symbols-outlined sm:text-[50px] ${label === "ordered" || (step && step.value >= 1) ? "text-zinc-700" : "text-zinc-200"}`}
                  >
                    credit_score
                  </span>
                  <span
                    className={`text-xs leading-3 tracking-normal ${label === "ordered" || (step && step.value >= 1) ? "text-zinc-700" : "text-zinc-200"}`}
                  >
                    Ordered
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
        <div className="flex w-full flex-row items-center justify-center">
          <div className="flex flex-col items-center gap-1">
            <span
              style={{ animationDuration: `3s` }}
              className={`material-symbols-outlined sm:text-[50px] ${label === "refunded" ? "text-green-500" : "text-yellow-500"}`}
            >
              pending
            </span>
            <span
              className={`text-xs leading-3 tracking-normal ${label === "refunded" ? "text-green-600" : "text-yellow-600"}`}
            >
              Refund Requested
            </span>
          </div>
          <div className="flex w-20 flex-col items-center justify-center sm:w-32">
            <div className="w-[90%]">
              <div className="relative pt-4 sm:pt-1">
                <div className="mb-4 flex h-1 w-auto overflow-hidden rounded bg-zinc-200 text-xs sm:h-2">
                  <div
                    className={`flex flex-col justify-center whitespace-nowrap text-center text-white shadow-none ${refundStep && refundStep.value >= 1 ? "w-full" : "w-[15%]"} ${label === "refunded" ? "bg-green-500" : "bg-yellow-500"}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            {(label === "refund on process" || label === "refunded") && (
              <>
                <span
                  style={{ animationDuration: `3s` }}
                  className={`material-symbols-outlined sm:text-[50px] ${label === "refunded" ? "text-green-500" : "text-yellow-500"}`}
                >
                  credit_card_clock
                </span>
                <span
                  className={`text-xs leading-3 tracking-normal ${label === "refunded" ? "text-green-600" : "text-yellow-600"}`}
                >
                  Refund on Process
                </span>
              </>
            )}
          </div>
          <div className="flex w-20 flex-col items-center justify-center sm:w-32">
            <div className="w-[90%]">
              <div className="relative pt-4 sm:pt-1">
                <div className="mb-4 flex h-1 w-auto overflow-hidden rounded bg-zinc-200 text-xs sm:h-2">
                  <div
                    className={`flex flex-col justify-center whitespace-nowrap text-center text-white shadow-none ${refundStep && refundStep.value >= 2 ? "w-full" : "w-[20%]"} ${label === "refunded" ? "bg-green-500" : "bg-yellow-500"}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span
              className={`material-symbols-outlined relative sm:text-[50px] ${label === "refunded" ? "text-green-500" : "text-zinc-200"}`}
            >
              check_circle
            </span>

            <span
              className={`text-xs leading-3 tracking-normal ${label === "refunded" ? "text-green-600" : "text-zinc-200"}`}
            >
              Refunded
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
