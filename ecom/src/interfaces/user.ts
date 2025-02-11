export interface User {
    email: string;
    firstName: string
    lastName:string
    phoneNo: string;
    address: AddressInterface[];
  }

  export interface AddressInterface {
    firstName: string;
    lastName: string;
    phoneNo: string;
    address: string;
    city: string;
    state: string;
    zip: number;
    country: string;
    default?: boolean;
    _id?: string;
}


