import { io } from 'socket.io-client';

export async function initializeSocket(token) {
    if (!token) {
        console.error('no token found, cannot connect socket');
        return null;
    }

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
        transports: ['websocket'],
        query: { token },
    });

    socket.on('connect', () => {
        console.log('socket connected');
    });

    socket.on('disconnect', () => {
        console.log('socket disconnected');
    });

    return socket;
}
