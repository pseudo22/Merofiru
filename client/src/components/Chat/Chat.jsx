import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { initializeSocket } from '../../assets/socketClient';
import { ApiClient } from '../../assets/axios';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../assets/firebaseConfig';
import back from '../../images/back.png';

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [lastMessageDetails, setLastMessageDetails] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const [receiverPfp, setReceiverPfp] = useState('');
  const [receiverUserName, setReceiverUserName] = useState('');

  const params = useParams();
  const navigate = useNavigate();
  const receiverId = params.id;

  const token = useSelector((state) => state.user.token);
  const userId = useSelector((state) => state.user.userId);

  const chatId = `${userId}_${receiverId}`;
  const reverseChatId = `${receiverId}_${userId}`;
  const chatDocId = chatId > reverseChatId ? reverseChatId : chatId;

  const [isLoading, setIsLoading] = useState(true);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    async function fetchReceiverDetails(receiverId) {
      const userRef = doc(db, 'users', receiverId);
      const receiverUserDoc = await getDoc(userRef);

      if (receiverUserDoc?.exists()) {
        const receiverUserData = receiverUserDoc?.data();
        setReceiverPfp(receiverUserData?.profilePicture);
        setReceiverUserName(receiverUserData?.displayName);
      }
    }

    fetchReceiverDetails(receiverId);
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await ApiClient.get(`/api/messages/${userId}/${receiverId}`);
        const { lastMessageDetails, chats } = response.data?.data;
        setMessages(chats || []);
        setLastMessageDetails(lastMessageDetails || null);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [userId, receiverId, token]);

  useEffect(() => {
    const createSocket = async () => {
      if (token) {
        const socketConnection = await initializeSocket(token);
        if (socketConnection) {
          setSocket(socketConnection);

          socketConnection.emit('user-connected', { userId, chatId: chatDocId });

          socketConnection.removeAllListeners('receive-message');
          socketConnection.on('receive-message', (messageData) => {
            setMessages((prevMessages) => {
              const isDuplicate = prevMessages.some(msg => msg.id === messageData.id);
              if (isDuplicate) return prevMessages;
              return [...prevMessages, messageData];
            });
          });

          socketConnection.on('typing', ({ senderId }) => {
            if (senderId !== userId) {
              setIsTyping(true);
              setTimeout(() => setIsTyping(false), 3000);
            }
          });

          return () => {
            socketConnection.off('receive-message');
            socketConnection.off('update-seen');
            socketConnection.off('typing');
            socketConnection.disconnect();
          };
        }
      }
    };

    createSocket();
  }, [token, userId, chatDocId]);

  const handleSendMessage = () => {
    if (socket && newMessage.trim()) {
      const timestamp = new Date().toISOString();
      const messageData = {
        senderId: userId,
        receiverId,
        message: newMessage,
        timestamp,
        seenByUsers: [userId],
      };
      socket.emit('send-message', messageData);
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    if (socket) {
      socket.emit('typing', { chatId: chatDocId, senderId: userId });
    }
  };

  const handleBack = () => {
    navigate('/chat');
  };

  const getMessageBackground = (message) => {
    if (lastMessageDetails?.id === message.id && lastMessageDetails?.seenByBoth) {
      return 'bg-blue-500';
    }
    const isSeenByBoth =
      message?.seenByUsers.includes(userId) && message?.seenByUsers.includes(receiverId);
    const isSeenBySender = message.seenByUsers.includes(userId);

    if (isSeenByBoth) {
      return 'bg-[#8e8772]';
    } else if (isSeenBySender) {
      return 'bg-[#9e978177]';
    }
    return 'bg-[#9e978177]';
  };

  if (isLoading || !socket) {
    return (
      <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg bg-[#CCD0CF] shadow-lg md:w-[50%] w-full h-auto">
        loading...
      </div>
    );
  }

  return (
    <div className="absolute flex flex-col gap-y-4 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-lg shadow-lg md:w-[80%] w-full h-[70%]">

      <div className="top flex gap-5 flex-row justify-start">
        <img
          onClick={handleBack}
          className="border p-1 cursor-pointer rounded-full"
          height={30}
          width={30}
          src={back}
          alt="back"
        />
        <img className="rounded-lg object-contain" height={30} width={30} src={receiverPfp} />
        <p>{receiverUserName}</p>
      </div>


      <div className="message overflow-y-auto flex-grow">
        {messages?.length === 0 ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="text-center">
              nothing is there-
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isSender = msg.senderId === userId;
            const messageBg = getMessageBackground(msg);

            return (
              <div
                key={idx}
                ref={idx === messages.length - 1 ? messagesEndRef : null}
                className={`flex m-4 ${isSender ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-2 md:text-lg text-white ${isSender ? 'rounded-s-md' : 'rounded-e-md'} w-fit ${messageBg}`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>




      <div className="flex flex-col justify-end">
        {isTyping && 'vocalizing...'}
      </div>


      <div className="send-text flex w-full mt-auto">
        <input
          onChange={(e) => setNewMessage(e.target.value)}
          value={newMessage}
          placeholder="type some melodies?"
          type="text"
          className="w-full py-2"
          onKeyDown={handleTyping}
        />
        <button
          onClick={handleSendMessage}
          className="flex justify-center bg-[#5cc6abeb] text-white items-center px-6 py-2 rounded-lg transition-all"
        >
          sing
        </button>
      </div>
    </div>
  );

}
