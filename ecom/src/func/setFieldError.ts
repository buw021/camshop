type ErrorItem = {
    type: string;
    value: string;
    msg: string;
    path: string;
    location: string;
  };
  
  type FieldErrorMap = {
    [key: string]: string[];
  };
  
  type Props = {
    errorArray: ErrorItem[];
  };
  
  export const setFieldErrors = ({ errorArray }: Props): FieldErrorMap => {
    const errorMap: FieldErrorMap = {};
      errorArray.forEach((err) => {
        if (!errorMap[err.path]) {
          errorMap[err.path] = []; 
        }
        errorMap[err.path].push(err.msg); 
      });

    return errorMap;
  };