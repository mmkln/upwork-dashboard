import React from "react";
import { useDrag, useDrop } from "react-dnd";

interface TileProps {
  id: string;
  index: number;
  moveTile: (dragIndex: number, hoverIndex: number) => void;
  children: React.ReactNode;
}

const Tile: React.FC<TileProps> = ({ id, index, moveTile, children }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: "tile",
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      moveTile(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "tile",
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: "16px",
        margin: "8px 0",
        backgroundColor: "#f0f0f0",
        borderRadius: "8px",
        cursor: "move",
      }}
    >
      {children}
    </div>
  );
};

export default Tile;
