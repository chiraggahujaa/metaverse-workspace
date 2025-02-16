import { WebSocket as WS } from 'ws';
import { joinSpace } from '../actions/joinSpace';
import { moveInSpace } from '../actions/moveInSpace';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const handleMessage = () => {
    try {
        const session = getServerSession(authOptions);
        console.log('Session:', session);
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'join':
                joinSpace(ws, parsedMessage.payload);
                break;
            case 'move':
                moveInSpace(ws, parsedMessage.payload);
                break;
            default:
                console.log(`Unknown message type: ${parsedMessage.type}`);
        }
    } catch (error) {
        console.error('Error parsing message:', error);
    }
};
