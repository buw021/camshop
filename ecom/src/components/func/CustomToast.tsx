export const CustomToast = ({ message }: { message: string }) => (
  <div dangerouslySetInnerHTML={{ __html: message }}></div>
);
