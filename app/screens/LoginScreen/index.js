import React from 'react';
import { AsyncStorage, View, Text } from 'react-native';
import { RkTextInput, RkButton } from 'react-native-ui-kitten';
import PropTypes from 'prop-types';

import styles from './styles';
import makeCancelable from '../../utils/makeCancelable';
import { requestDB } from '../../services/Api';

/**
 * @author Riyad Shauk
 */
export default class LoginScreen extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = {
    title: 'Login'
  };

  state = {
    email: 'user1@example.com',
    users: [],
    fetchUsersRequest: undefined,
    invalidEmailSubmitted: false
  };

  async componentDidMount() {
    this.setState({ fetchUsersRequest: await this.fetchUsers() });
  }

  /**
   * @see https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component/
   * @see https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
   */
  componentWillUnmount() {
    if (
      this.state.createChallengeRequest &&
      this.state.createChallengeRequest.cancel instanceof Function
    ) {
      this.state.createChallengeRequest.cancel();
    }
    // @ts-ignore
    if (this.state.fetchUsersRequest.cancel instanceof Function) {
      // @ts-ignore
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
          reject(err);
        }
      })
    );
  };

  verifyValidEmail = async () => {
    const { navigation } = this.props;
    const { navigate } = navigation;
    await (await this.state.fetchUsersRequest).promise;
    if (this.state.users === []) {
      // prevent UI bug where user opens app without internet connection
      // (assuming this.state.users !== [] when the fetch is successful)
      this.setState({ fetchUsersRequest: await this.fetchUsers() });
      await (await this.state.fetchUsersRequest).promise;
    }
    const { users, email } = this.state;
    let valid = false;
    users.forEach(async user => {
      if (email === user.email) {
        valid = true;
        await AsyncStorage.setItem('user_id', String(user.id));
        await AsyncStorage.setItem('email', email);
        navigate('Main', { email, user_id: user.user_id });
      }
    });
    if (!valid) {
      this.setState({ invalidEmailSubmitted: true });
    }
  };

  InvalidMessage = () => {
    const { invalidEmailSubmitted, email } = this.state;
    if (invalidEmailSubmitted) {
      return (
        <Text>
          {`Sorry, '${email}' is an invalid email. Please provide a correct email to continue.`}
        </Text>
      );
    }
    return <Text />;
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Login</Text>
        <RkTextInput
          placeholder="email"
          defaultValue="user1@example.com"
          onChangeText={email =>
            this.setState({ email, invalidEmailSubmitted: false })
          }
          autoCapitalize="none"
        />
        <RkButton
          rkType="primary xlarge"
          onPress={() => this.verifyValidEmail()}
        >
          <Text>Login</Text>
        </RkButton>
        <this.InvalidMessage />
      </View>
    );
  }
}
