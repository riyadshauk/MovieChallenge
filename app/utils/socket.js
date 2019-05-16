import io from 'socket.io-client';
import config from '../../config';

const socket = io(config.chatSocketURL, { path: config.chatSocketPath });

/**
 * @see https://socket.io/docs/client-api/
 * @see https://github.com/socketio/socket.io-client
 */
export default socket;
