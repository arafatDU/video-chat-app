import React from 'react';
import { useParams } from 'react-router-dom';

const Room = () => {
  const { roomID } = useParams();

  return (
    <div>
      <h1>Room ID: {roomID}</h1>
    </div>
  );
};

export default Room;