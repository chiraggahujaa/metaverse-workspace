import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSession } from 'next-auth/react';

const useSocket = () => {
    const [socket, setSocket] = useState<any>(null);
    const { data: session, status } = useSession();

    console.log('status', status);

    useEffect(() => {
        if (status === 'authenticated') {
            const socketInstance = io('http://localhost:8080');
            setSocket(socketInstance);

            // Cleanup on unmount
            return () => {
                socketInstance.disconnect();
            };
        } else {
            setSocket(null);
        }
    }, [status]);

    return socket;
};

export default useSocket;