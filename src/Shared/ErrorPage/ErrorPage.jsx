import React from "react";
import Lottie from "lottie-react";
import Animation from "./Animation.json";
import { Link } from "react-router-dom";

const ErrorPage = () => {
  return (
    <div className="container mx-auto md:grid md:grid-cols-2">
      <div className="animation-container">
        <Lottie animationData={Animation} className="lottie-background" />
      </div>
      <div className="flex flex-col justify-center items-center">
        <h1 className="md:text-7xl text-primary mb-4">Wanna Go Home?</h1>
        <div>
          <Link to="/">
            {" "}
            <button className="btn btn-wide btn-primary text-white ">
              Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;