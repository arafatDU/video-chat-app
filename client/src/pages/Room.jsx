import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketProvider';

const Room = () => {
  const socket = useSocket();

  const handleUserJoined = ({email, id}) => {
    console.log(email, id);
  }
  
  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    return () => {
      socket.off("user:joined");
    }
  }, [socket, handleUserJoined]);

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <h1>Room</h1>
    </div>
  );
};

export default Room;