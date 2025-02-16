import React from "react";
import "./Space.css";

interface SpaceProps {
  space: {
    id: string;
    name: string;
    dimensions: string;
    thumbnail: string | null;
  };
  onJoin: (roomName: string) => void;
}

const Space: React.FC<SpaceProps> = ({ space, onJoin }) => {
  return (
    <div className="space-box">
      <h2>{space.name}</h2>
      <p>{space.dimensions}</p>
      {space.thumbnail && <img src={space.thumbnail} alt={space.name} />}
      <button onClick={() => onJoin(space.name)}>Join</button>
    </div>
  );
};

export default Space;