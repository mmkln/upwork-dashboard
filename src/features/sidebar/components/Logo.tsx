import React from "react";

const Logo: React.FC = () => (
  <div className="flex items-center overflow-hidden">
    <a className="flex items-center justify-center group" href="#">
      <div className="flex items-center justify-center gap-1.5">
        <div className="flex justify-center items-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M18.561 12.666C17.459 12.666 16.426 12.199 15.487 11.439L15.715 10.363L15.723 10.321C15.93 9.178 16.572 7.261 18.562 7.261C20.054 7.261 21.265 8.473 21.265 9.964C21.264 11.453 20.053 12.666 18.561 12.666ZM18.561 4.526C16.022 4.526 14.051 6.175 13.251 8.892C12.031 7.058 11.103 4.856 10.564 3H7.828V10.112C7.826 11.518 6.687 12.658 5.281 12.66C3.876 12.658 2.738 11.517 2.736 10.112V3H0V10.112C0 13.026 2.37 15.415 5.281 15.415C8.194 15.415 10.564 13.026 10.564 10.112V8.922C11.093 10.029 11.746 11.151 12.538 12.143L10.865 20.016H13.662L14.875 14.306C15.938 14.985 17.16 15.415 18.561 15.415C21.561 15.415 24 12.963 24 9.965C24 6.965 21.561 4.526 18.561 4.526Z"
              fill="#0B106F"
            />
          </svg>
        </div>
        {/* <span className="hidden group-hover:inline-block text-md font-semibold text-[#575757] transition-colors duration-300">
          Upboard
        </span> */}
      </div>
    </a>
  </div>
);

export default Logo;
