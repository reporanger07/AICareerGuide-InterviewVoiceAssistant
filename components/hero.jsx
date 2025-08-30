import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    
      <section className="w-full pt-36 md:pt-48 pb-10">
        <div className="space-y-6 text-center">
            <div className="space-y-6 mx-auto">
          <h1 className=" text-5xl font-bold md:text-6xl lg:text-7xl">
            {" "}
            Your AI Career Coach for
            <br />
            Professional Success
          </h1>
          <p>
            Unlock your potential with expert guidance,interview prep, skill-building,
            resources, and AI-driven tools designed to accelerate your career
            growth.
          </p>
        </div>
        <div>
            <Link href="/dashboard">
            <Button size='lg' className="px-8 ">
                Get Started
            </Button>
            </Link>
        </div>
        </div>
      </section>
    
  );
};

export default HeroSection;
