import { Server } from 'socket.io';
import { db } from '../utils/firebaseAdmin.js';
import { authenticateSocket } from '../middlewares/auth.middleware.js';


export function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    const userSocketsRef = db.collection('userSockets');
    const chatRef = db.collection('chats');
    const userRef = db.collection('users');

    // middleware to authenticate socket
    io.use(authenticateSocket);

    // handle socket connections
    io.on('connection', (socket) => {
        socket.on('user-connected', async ({ userId, chatId }) => {
            try {
                const userDoc = userSocketsRef.doc(userId);
                await userDoc.set({ userId, socketId: socket.id, roomId: chatId });
                console.log(`User ${userId} connected with socket ID ${socket.id}`);

                socket.join(chatId);
                console.log(`User ${userId} joined chat room ${chatId}`);
            } catch (error) {
                console.error('Error while saving user connection:', error);
            }
        });

        socket.on('send-message', async ({ senderId, receiverId, message, timestamp, seenByUsers }) => {
            try {
                const chatId = `${senderId}_${receiverId}`;
                const reverseChatId = `${receiverId}_${senderId}`;
                const chatDocId = chatId > reverseChatId ? reverseChatId : chatId;

                const chatDocRef = chatRef.doc(chatDocId);
                const messageRef = chatDocRef.collection('messages').doc();

                const currentSeen = seenByUsers || [senderId];

                const newMessageData = {
                    id: messageRef.id,
                    senderId,
                    receiverId,
                    message,
                    timestamp,
                    seenByUsers: currentSeen,
                };

                await messageRef.set(newMessageData);

                const receiverSocketSnap = await userSocketsRef.doc(receiverId).get();
                const receiverCurrentRoom = receiverSocketSnap.data()?.roomId || null;


                const updatedSeenByUsers = receiverCurrentRoom === chatDocId
                    ? [senderId, receiverId]
                    : [senderId];

                io.to(chatDocId).emit('receive-message', {
                    ...newMessageData,
                    seenByUsers: updatedSeenByUsers,
                });

                await messageRef.set({
                    ...newMessageData , seenByUsers : updatedSeenByUsers
                })

                await chatDocRef.set(
                    {
                        lastMessage: {
                            ...newMessageData,
                            seenByUsers: updatedSeenByUsers,
                        }
                    },
                    { merge: true }
                );

            } catch (error) {
                console.error('Error while sending message:', error);
            }
        });

        // typing
        socket.on('typing', ({ chatId, senderId }) => {
            socket.broadcast.to(chatId).emit('typing', { senderId });
        });


        // Handle user disconnection
        socket.on('disconnect', async () => {
            try {
                const userSocketsSnap = await userSocketsRef.where('socketId', '==', socket.id).get();
                if (!userSocketsSnap.empty) {
                    userSocketsSnap.forEach(async (doc) => {
                        await doc.ref.delete();
                    });
                    console.log(`Socket ID ${socket.id} removed from userSockets collection`);
                }
            } catch (error) {
                console.error('Error while handling user disconnection:', error);
            }
        });
    });

    return io;
}