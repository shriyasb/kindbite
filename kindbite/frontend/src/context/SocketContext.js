import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('kb_token');
    if (!user || !token || user.role === 'admin') return;

    const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('new_food_post', ({ message }) => {
      if (user.role === 'ngo') {
        toast.success(message, { duration: 5000 });
        setUnreadCount(c => c + 1);
      }
    });

    socket.on('request_accepted', ({ request }) => {
      toast.success(`${request.ngo?.name || 'An NGO'} accepted your donation!`, { duration: 5000 });
      setUnreadCount(c => c + 1);
    });

    socket.on('food_picked_up', () => {
      toast.success('Your donation has been picked up!', { duration: 4000 });
      setUnreadCount(c => c + 1);
    });

    socket.on('food_delivered', ({ mealsSaved }) => {
      toast.success(`Donation delivered! ${mealsSaved} meals saved`, { duration: 6000 });
      setUnreadCount(c => c + 1);
    });

    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, unreadCount, setUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
