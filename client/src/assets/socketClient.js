import { io } from 'socket.io-client';

export async function initializeSocket(token) {
    if (!token) {
        console.error('No token found. Cannot establish socket connection.');
        return null;
    }

    const socket = io(import.meta.env.VITE_BACKEND_URL, {
        transports: ['websocket'],
        query: { token },
    });

    socket.on('connect', () => {
        console.log('Socket connected with ID:', socket.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    return socket;
}
