import React, { useEffect, useRef, useState } from "react";

type DropdownProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
};

const Dropdown: React.FC<DropdownProps> = ({
  label,
  children,
  align = "right",
  className = "",
  buttonClassName = "",
  menuClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-flex ${className}`} ref={rootRef}>
      <button
        type="button"
        className={`inline-flex items-center gap-2 rounded-[10px] border border-[#EFF0F0] bg-white px-3 py-2 text-xs font-medium text-[#575757] transition-colors duration-200 hover:bg-[#F6F8FF] focus:outline-none focus:ring-2 focus:ring-[#C4C4FD] ${buttonClassName}`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
      </button>

      {isOpen && (
        <div
          className={`absolute mt-2 min-w-[160px] rounded-[10px] border border-[#EFF0F0] bg-white p-2 shadow-lg ${
            align === "left" ? "left-0" : "right-0"
          } ${menuClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
