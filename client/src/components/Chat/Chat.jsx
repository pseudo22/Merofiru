import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { initializeSocket } from '../../assets/socketClient';

const ChatComponent = () => {
  const [socket, setSocket] = useState(null);
  const token = useSelector((state) => state.user.token)

  useEffect(() => {
    const createSocket = async () => {
      if (token) {
        const socketConnection = await initializeSocket(token);
        if (socketConnection) {
          setSocket(socketConnection);
        }
      }
    };

    createSocket();

    return () => {
      if (socket) {
        socket.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, [token]);

  if (!socket) {
    return <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#CCD0CF] shadow-lg md:w-[50%] w-full h-auto">loading...</div>
  }

  return (
    <>
    <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#CCD0CF] shadow-lg md:w-[50%] w-full h-auto">
    <h1>Heyy</h1>
    </div>
    </>
  );
};

export default ChatComponent;
