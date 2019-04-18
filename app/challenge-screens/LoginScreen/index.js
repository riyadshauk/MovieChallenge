import React from 'react';
import { AsyncStorage, View, Text } from 'react-native';
import { RkTextInput, RkButton } from 'react-native-ui-kitten';
import PropTypes from 'prop-types';

import config from '../../../config';
import styles from './styles';

const { headers } = config;

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
    email: '',
    users: [],
    invalidEmailSubmitted: false
  };

  async componentDidMount() {
    this.setState({ users: await this.fetchUsers() });
  }

  fetchUsers = () => {
    return new Promise(async (resolve, reject) => {
      const options = {
        method: 'get',
        headers,
        json: true
      };
      try {
        const response = await fetch(
          `${config.baseURL}/mobile/custom/Ash_SKy/SkyGet`,
          options
        );
        const { items } = await response.json();
        resolve(items);
      } catch (err) {
        reject(err.stack);
      }
    });
  };

  verifyValidEmail = async () => {
    const { users, email } = this.state;
    const { navigation } = this.props;
    const { navigate } = navigation;
    await users;
    let valid = false;
    users.forEach(async user => {
      if (email === user.email) {
        valid = true;
        await AsyncStorage.setItem('userID', String(user.id));
        await AsyncStorage.setItem('email', email);
        navigate('Main', { email, userID: user.userID });
      }
    });
    if (!valid) {
      this.setState({ invalidEmailSubmitted: true });
    }
  };

  InvalidMessage = () => {
    const { invalidEmailSubmitted, email } = this.state;
    return invalidEmailSubmitted ? (
      <Text>
        Sorry,
        {` '${email}' `}
        is an invalid email. Please provide a correct email to continue.
      </Text>
    ) : (
      <Text />
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Login</Text>
        <RkTextInput
          placeholder="email"
          onChangeText={email =>
            this.setState({ email, invalidEmailSubmitted: false })
          }
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
