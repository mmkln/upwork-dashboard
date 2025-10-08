// Sidebar.tsx
import React from "react";
import { useLocation } from "react-router-dom";
import Logo from "./components/Logo";
import SidebarItem from "./components/SidebarItem";
import SidebarSection from "./components/SidebarSection";
import AccountButton from "./components/AccountButton";

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed z-50 top-0 left-0 flex flex-col w-20 h-screen bg-[#001844] text-gray-400 transition-all duration-300 hover:w-44 group p-4">
      <Logo />
      <SidebarSection>
        <SidebarItem
          icon={
            <svg
              className="w-6 h-6 stroke-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"
              />
            </svg>
          }
          label="Dashboard"
          link="/upwork-dashboard"
          currentPath={location.pathname}
        />
        <SidebarItem
          icon={
            <svg
              className="w-6 h-6 stroke-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
              />
            </svg>
          }
          label="Jobs"
          link="/upwork-dashboard/jobs"
          currentPath={location.pathname}
        />
        {/*<SidebarItem*/}
        {/*  icon={*/}
        {/*    <svg*/}
        {/*      className="w-6 h-6 stroke-current"*/}
        {/*      viewBox="0 0 24 24"*/}
        {/*      fill="none"*/}
        {/*      xmlns="http://www.w3.org/2000/svg"*/}
        {/*    >*/}
        {/*      <path*/}
        {/*        d="M11.0656 8.00389L11.25 7.99875H18.75C20.483 7.99875 21.8992 9.3552 21.9949 11.0643L22 11.2487V18.7487C22 20.4818 20.6435 21.898 18.9344 21.9936L18.75 21.9987H11.25C9.51697 21.9987 8.10075 20.6423 8.00515 18.9332L8 18.7487V11.2487C8 9.51571 9.35646 8.0995 11.0656 8.00389ZM18.75 9.49875H11.25C10.3318 9.49875 9.57881 10.2059 9.5058 11.1052L9.5 11.2487V18.7487C9.5 19.6669 10.2071 20.4199 11.1065 20.4929L11.25 20.4987H18.75C19.6682 20.4987 20.4212 19.7916 20.4942 18.8923L20.5 18.7487V11.2487C20.5 10.2822 19.7165 9.49875 18.75 9.49875ZM15 11C15.4142 11 15.75 11.3358 15.75 11.75V14.248L18.25 14.2487C18.6642 14.2487 19 14.5845 19 14.9987C19 15.413 18.6642 15.7487 18.25 15.7487L15.75 15.748V18.25C15.75 18.6642 15.4142 19 15 19C14.5858 19 14.25 18.6642 14.25 18.25V15.748L11.75 15.7487C11.3358 15.7487 11 15.413 11 14.9987C11 14.5845 11.3358 14.2487 11.75 14.2487L14.25 14.248V11.75C14.25 11.3358 14.5858 11 15 11ZM15.5818 4.23284L15.6345 4.40964L16.327 6.998H14.774L14.1856 4.79787C13.9355 3.86431 12.9759 3.31029 12.0423 3.56044L4.79787 5.50158C3.91344 5.73856 3.36966 6.61227 3.52756 7.49737L3.56044 7.64488L5.50158 14.8893C5.69372 15.6064 6.30445 16.0996 7.00045 16.1764L7.00056 17.6816C5.69932 17.6051 4.52962 16.7445 4.10539 15.4544L4.05269 15.2776L2.11155 8.03311C1.66301 6.35913 2.6067 4.6401 4.23284 4.10539L4.40964 4.05269L11.6541 2.11155C13.3281 1.66301 15.0471 2.6067 15.5818 4.23284Z"*/}
        {/*        fill="currentColor"*/}
        {/*        stroke="none"*/}
        {/*      />*/}
        {/*    </svg>*/}
        {/*  }*/}
        {/*  label="Collections"*/}
        {/*  link="/upwork-dashboard"*/}
        {/*  currentPath={location.pathname}*/}
        {/*/>*/}
      </SidebarSection>
      {/*<AccountButton />*/}
    </div>
  );
};

export default Sidebar;
