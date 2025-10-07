import React from "react";

const Logo: React.FC = () => (
  <div className="flex w-full items-center mb-8 overflow-hidden">
    <a className="flex items-center justify-center group" href="#">
      <div className="flex items-center justify-center">
        {/*<svg*/}
        {/*  className="w-8 h-8 text-gray-400 group-hover:text-gray-200 transition-colors duration-300"*/}
        {/*  xmlns="http://www.w3.org/2000/svg"*/}
        {/*  viewBox="0 0 20 20"*/}
        {/*  fill="currentColor"*/}
        {/*>*/}
        {/*  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />*/}
        {/*</svg>*/}
          <div className="w-12 h-12 flex justify-center items-center rounded-full bg-[#012567]">
              <svg className="w-8 h-8 text-gray-400 group-hover:text-gray-200 transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" fill="#005AFC" width="800px" height="800px" viewBox="0 0 24 24" role="img">
                  <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.548-1.405-.002-2.543-1.143-2.545-2.548V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z"/>
              </svg>
          </div>
        <span className="hidden group-hover:inline-block ml-2 text-md font-bold text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
          Upboard
        </span>
      </div>
    </a>
  </div>
);

export default Logo;
