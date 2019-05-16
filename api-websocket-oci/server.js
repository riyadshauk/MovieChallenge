import express from 'express';
import socketIO from 'socket.io';

const app = express();
const port = process.env.PORT || 3000;
// eslint-disable-next-line no-console
const io = socketIO.listen(
  app.listen(port, () => console.log(`listening on port ${port}!`))
);

io.on('connection', socket => {
  socket.on('chat message', msg => {
    try {
      io.emit('chat message', msg);
      const [{ recipientID, senderID, text }] = msg;
      io.emit(recipientID, JSON.stringify({ senderID, text }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        new Error(
          `The client probably did not pass in a message of the form [{"recipientID": 2,
        "senderID": 1, "text": "a message (nested in an object in a one-element array)
        from user1 to user2"}]`.replace(/\s/, ' ')
        ).stack
      );
    }
  });
});
