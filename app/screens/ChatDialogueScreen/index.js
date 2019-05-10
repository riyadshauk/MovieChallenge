/* eslint-disable camelcase */
import React, { Component } from 'react';
import { AsyncStorage } from 'react-native';
import PropTypes from 'prop-types';
import { GiftedChat } from 'react-native-gifted-chat';
import io from 'socket.io-client';

// import styles from './styles';
// import makeCancelable from '../../utils/makeCancelable';
// import { requestDB } from '../../services/Api';

/**
 * @author Farid Safi (for starter Gifted Chat code)
 * @author Riyad Shauk
 *
 * @todo Make a chat here (starting with a simple websocket server).
 * Then try to put that websocket API on Mobile Hub (it still uses express,
 * but also http, might be possible with a bit of hackery).
 *
 * This chat screen should look and feel close to Messenger or Whatsapp
 * (look into [even more?] UI libraries?).
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
    messages: []
  };

  async componentWillMount() {
    const { getItem } = AsyncStorage;
    const user_id = await getItem('user_id');
    const { getParam } = this.props.navigation;
    const otherUser = getParam('otherUser');
    this.setState({
      messages: [
        {
          _id: 1,
          text: `Hello, user${user_id}. Welcome to your chat with ${otherUser}`,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placeimg.com/140/140/any'
          }
        }
      ]
    });
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));
  }

  /**
   * @todo (on Monday)
   * @see https://socket.io/docs/client-api/
   * @see https://github.com/socketio/socket.io-client
   */
  // eslint-disable-next-line class-methods-use-this
  configureWebSocket() {
    const socket = io('http://localhost:3000');

    // eslint-disable-next-line no-unused-vars
    socket.on('chat-message', msg => {
      // @todo
    });
  }

  render() {
    return (
      <GiftedChat
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
          _id: 1
        }}
      />
    );
  }
}
