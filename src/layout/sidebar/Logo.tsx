import React from "react";

import ubAppLogo from "../../assets/ub-app-logo.svg";

const Logo: React.FC = () => (
  <div className="flex items-center overflow-hidden">
    <a className="group/logo flex h-target w-target items-center justify-center rounded-full transition-colors duration-motion-fast ease-motion-standard hover:bg-control-hover focus:outline-none focus:ring-2 focus:ring-ring" href="#" aria-label="Upwork Dashboard home">
      <div className="flex items-center justify-center gap-tag">
        <div className="flex justify-center items-center">
          <img
            src={ubAppLogo}
            alt=""
            className="h-6 w-6"
            aria-hidden="true"
          />
        </div>
      </div>
    </a>
  </div>
);

export default Logo;
