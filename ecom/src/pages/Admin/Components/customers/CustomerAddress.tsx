import { AddressInterface } from "../interface/interfaces";

const CustomerAddress = (address: AddressInterface) => {
  return (
    <div className="z-10 flex w-full flex-col gap-1 rounded border-[1px] bg-white p-2 leading-3 hover:bg-zinc-100">
      <p className="roboto-medium border-b-[1px] pb-1 text-sm leading-3 tracking-wider">
        {address.firstName} {address.lastName}
      </p>

      <p className="flex flex-col gap-1 text-xs leading-3">
        <span>
          <span className="font-medium">Address:</span>{" "}
          {address.address.split("_").join(" ")}
        </span>
        <span>
          <span className="font-medium">City & State:</span> {address.city},{" "}
          {address.state}
        </span>
        <span>
          <span className="font-medium">Postal Code:</span> {address.zip}
        </span>
        <span>
          <span className="font-medium">Country:</span> {address.country}
        </span>
        <span>
          <span className="font-medium">Phone Number:</span> {address.phoneNo}
        </span>
      </p>
    </div>
  );
};

export default CustomerAddress;
