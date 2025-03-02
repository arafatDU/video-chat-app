import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import peer from '../service/peer';
import ReactPlayer from 'react-player';

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);

  const handleUserJoined = ({email, id}) => {
    console.log(email, id);
    setRemoteSocketId(id);
  }

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setMyStream(stream);

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });

  }, [remoteSocketId, socket]);


  const handleIncommingCall = useCallback(async ({from, offer}) => {
    console.log(from, offer);
  }, [socket]);
  

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncommingCall);

    return () => {
      socket.off("user:joined");
      socket.off("incoming:call");
    }
  }, [socket, handleUserJoined, handleIncommingCall]);

  return (
    <div className='items-center justify-center min-h-screen bg-gray-100'>
      <h1 className='text-5xl font-bold text-center p-4'>Room Page</h1>
      <br />
      <h4 className='text-2xl font-bold text-center'> {remoteSocketId ? 'Connected' : 'No one in Room'} </h4>

      <div className='flex justify-center items-center'>
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold mt-5 py-2 px-4 rounded' onClick={handleCallUser}>CALL
        </button>
      </div>
      
      <div className='mt-5 p-5'>
        <h3 className='text-2xl m-3 py-3'>My Stream</h3>
        {myStream && <ReactPlayer url={myStream}  playing={true} height="200px" width="300px" muted/>}
      </div>
    </div>
  );
};

export default Room;