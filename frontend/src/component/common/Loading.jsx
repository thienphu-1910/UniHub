import { Spinner } from "flowbite-react";

const Loading = () => {
  return (
    <div className="w-full flex flex-row justify-center items-center h-full">
      <Spinner />
    </div>
  );
};

export default Loading;
