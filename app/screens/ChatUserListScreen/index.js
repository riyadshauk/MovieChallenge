/* eslint-disable camelcase */
import React, { Component } from 'react';
import {
  AsyncStorage,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import makeCancelable from '../../utils/makeCancelable';
import { requestDB } from '../../services/Api';

/**
 * @author Riyad Shauk
 *
 * @todo Flatlist of users to select here, then navigate to ChatDialogueScreen with
 * selected chatUser as navigation param.
 *
 * This should also look/feel somewhat like the user list seen on Messenger or Whatsapp
 * (look into UI libraries?).
 */
export default class ChatUserListScreen extends Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = {
    title: 'Choose a User to Chat With'
  };

  state = {
    users: [],
    fetchUsersRequest: undefined,
    user_id: undefined
  };

  async componentDidMount() {
    const { getItem } = AsyncStorage;
    this.setState({
      user_id: await getItem('user_id'),
      fetchUsersRequest: await this.fetchUsers()
    });
  }

  /**
   * @see https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component/
   * @see https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
   */
  componentWillUnmount() {
    if (
      this.state.fetchUsersRequest &&
      this.state.fetchUsersRequest.cancel instanceof Function
    ) {
      this.state.fetchUsersRequest.cancel();
    }
  }

  fetchUsers = () => {
    return makeCancelable(
      new Promise(async (resolve, reject) => {
        try {
          const users = (await requestDB({ method: 'get', table: 'user' }))
            .items;
          this.setState({ users });
          resolve(users);
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };

  /**
   * This design is hacky for now / for POC purposes.
   */
  extractUserName = user => user.email.replace('@example.com', '');

  render() {
    const { navigate } = this.props.navigation;
    const { user_id } = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.users.map(user => ({
            key: this.extractUserName(user)
          }))}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={{ ...styles.list, ...styles.backgroundColor(index) }}
              onPress={() =>
                navigate('ChatDialogue', { otherUser: item.key, user_id })
              }
            >
              <Text style={styles.item}>{item.key}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }
}
