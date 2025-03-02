import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketProvider';
import peer from '../service/peer';
import ReactPlayer from 'react-player';

const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const handleUserJoined = ({email, id}) => {
    console.log(email, id);
    setRemoteSocketId(id);
  }

  const handleCallUser = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);

      const offer = await peer.getOffer();
      socket.emit('user:call', { to: remoteSocketId, offer });
    } catch (error) {
      console.error('Error during handleCallUser:', error);
    }
  }, [remoteSocketId, socket]);


  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    try {
      setRemoteSocketId(from);
      console.log(`Incomming Call ` ,from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });

    } catch (error) {
      console.error('Error during handleIncommingCall:', error);
    }
  }, [socket]);


  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);


  const handleCallAccepted = useCallback(({ from, ans }) => {
    try {
      peer.setLocalDescription(ans);
      console.log(`Call Accepted`, from, ans);
      sendStreams();

    } catch (error) {
      console.error('Error during handleCallAccepted:', error);
    }
  }
  , [sendStreams]);


  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);


  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);


  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);


  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);


    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    }
  }, [socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);

  return (
    <div className='items-center justify-center min-h-screen bg-gray-100'>
      <h1 className='text-5xl font-bold text-center p-4'>Room Page</h1>
      <br />
      <h4 className='text-2xl font-bold text-center'> {remoteSocketId ? 'Connected' : 'No one in Room'} </h4>

      <div className='flex justify-center items-center'>
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold mt-5 py-2 px-4 rounded' onClick={handleCallUser}>CALL
        </button>
      </div>
      
      <div className='flex justify-center items-center'>
      {myStream && 
        <div className='mt-5 p-5'>
          <span className='text-2xl m-3 py-3'>My Stream</span>
          <ReactPlayer url={myStream}  playing={true} height="200px" width="300px" muted/>
        </div>
      } 

      {remoteStream && 
        <div className='mt-5 p-5'>
          <h3 className='text-2xl m-3 py-3'>Remote Stream</h3>
          <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold m-5 py-2 px-4 rounded' onClick={handleCallUser}>Accept</button>

          <ReactPlayer url={remoteStream} playing={true} height="200px" width="300px"/>
        </div>
      }
      
      </div>
    </div>
  );
};

export default Room;