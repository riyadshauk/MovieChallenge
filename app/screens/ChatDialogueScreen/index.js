/* eslint-disable camelcase */
import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import PropTypes from 'prop-types';
import { GiftedChat } from 'react-native-gifted-chat';

import socket from '../../utils/socket';
// import { requestDB } from '../../services/Api';

/**
 * @author Farid Safi (for starter Gifted Chat code)
 * @author Riyad Shauk
 *
 * @todo Figure out required networking to get the websocket server running on
 * a VM Compute Instance on OCI (can stick with Node.js).
 *
 * @todo Add test ~5 BDD test cases for the sendListener / receiveListener logic
 * (tricky enough to warrant explaining as comments below).
 */
export default class ChatDialogueScreen extends Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = ({ navigation }) => {
    const otherUser = navigation.getParam('otherUser', '...');
    return {
      title: `Chat with ${otherUser}`
    };
  };

  state = {
    messages: [],
    recipientID: undefined,
    senderID: undefined,
    sendListener: undefined,
    receiveListener: undefined
  };

  async componentDidMount() {
    const { getItem } = AsyncStorage;
    const user_id = await getItem('user_id');
    const { getParam } = this.props.navigation;
    const otherUser = getParam('otherUser');
    const recipientID = otherUser.match(/(\d+)/)[0];
    this.setState({ recipientID, senderID: user_id });
    let messageID = 1;
    const message = msg => ({
      _id: messageID,
      text: msg,
      createdAt: new Date(),
      user: {
        _id: user_id,
        name: 'React Native',
        avatar: 'https://placeimg.com/140/140/any'
      }
    });
    this.setState({
      sendListener: msg => {
        const [{ senderID }] = msg;
        /**
         * Iff the message sender is the current user, display the message in the dialogue
         * screen with the appropriate current-user-is-sender styling.
         */
        if (senderID === user_id) {
          messageID += 1;
          this.setState(prevState => ({
            messages: GiftedChat.append(prevState.messages, msg)
          }));
        }
      },
      receiveListener: msg => {
        const { senderID, text } = JSON.parse(msg);
        /**
         * Iff the sender is the other user in the conversation, display the message in the
         * dialogue screen with the appropriate current-user-is-receiver styling.
         */
        if (senderID === recipientID) {
          messageID += 1;
          this.setState(prevState => ({
            // @ts-ignore
            messages: GiftedChat.append(prevState.messages, message(text))
          }));
        }
      }
    });
    socket.on('chat message', this.state.sendListener);
    socket.on(user_id, this.state.receiveListener);
  }

  /**
   * @see https://stackoverflow.com/questions/55969596/cant-call-setstate-inside-socket-io-callback-react-js
   * @see https://socket.io/docs/client-api/#socket-on-eventName-callback
   * @see https://github.com/component/emitter
   */
  async componentWillUnmount() {
    const { receiveListener, sendListener } = this.state;
    const { getItem } = AsyncStorage;
    const user_id = await getItem('user_id');
    socket.off(user_id, receiveListener);
    socket.off('chat message', sendListener);
  }

  onSend(messages = []) {
    const { recipientID, senderID } = this.state;
    const [message] = messages;
    message.recipientID = recipientID;
    message.senderID = senderID;
    socket.emit('chat message', messages);
  }

  render() {
    const { messages } = this.state;
    return (
      <GiftedChat
        messages={messages}
        onSend={msgs => this.onSend(msgs)}
        user={{ _id: 1 }}
      />
    );
  }
}
