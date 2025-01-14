export interface User {
    email: string;
    firstName: string
    lastName:string
    phoneNo: string;
    address: Address[];
  }

  export interface Address {
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


