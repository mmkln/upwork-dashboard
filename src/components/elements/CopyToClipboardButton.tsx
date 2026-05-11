import React from "react";
import { Clipboard } from "lucide-react";
import { IconButton } from "../../shared/ui";

interface CopyToClipboardButtonProps {
  data: string;
  name?: string;
}

const CopyToClipboardButton: React.FC<CopyToClipboardButtonProps> = ({
  data,
  name,
}) => {
  const handleClick = () => {
    navigator.clipboard
      .writeText(data)
      .then(() => {
        alert(`${name} copied to clipboard!`);
      })
      .catch((err) => {
        console.error("Error ", err);
        alert(`Could not copy ${name} to clipboard`);
      });
  };

  return (
    <IconButton
      variant="ghost"
      size="md"
      title={`Copy ${name} to clipboard`}
      aria-label={`Copy ${name} to clipboard`}
      onClick={handleClick}
    >
      <Clipboard className="h-4 w-4" />
    </IconButton>
  );
};

export default CopyToClipboardButton;
