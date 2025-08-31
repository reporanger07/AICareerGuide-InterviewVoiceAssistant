import React, { Suspense } from "react";
import { PacmanLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div className="px-5 pt-24">
     
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <PacmanLoader color="gray" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;
