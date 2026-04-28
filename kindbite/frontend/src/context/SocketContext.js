import React, { createContext, useContext, useState } from 'react';

const SocketContext = createContext();

// Demo mode: no real socket, just a stub so nothing crashes
export const SocketProvider = ({ children }) => {
  const [unreadCount] = useState(2); // show 2 unread for demo

  return (
    <SocketContext.Provider value={{ socket: null, connected: true, unreadCount, setUnreadCount: () => {} }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
