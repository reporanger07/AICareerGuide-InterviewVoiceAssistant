import React, { Suspense } from "react";
import {PacmanLoader} from "react-spinners"
const layout = ({ children }) => {
  return (
    <div className=" px-5 pt-24">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold text-center ">Market Overview</h1>
      </div>
      <Suspense fallback={<PacmanLoader className="mt-4" width={"100%"} color="gray" />}>{children}</Suspense>
    </div>
  );
};

export default layout;
