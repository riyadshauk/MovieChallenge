import React from 'react';
import { View, Text } from 'react-native';
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
  }

  static navigationOptions = {
    title: 'Login'
  };

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      users: this.fetchUsers(),
      invalidEmailSubmitted: false
    };
  }

  fetchUsers = async () => {
    const options = {
      method: 'get',
      headers,
      json: true
    };
    const response = await fetch(`${config.baseURL}/mobile/custom/Ash_SKy/SkyGet`, options);
    const { items } = await response.json();
    this.setState({ users: items }); // ...huh?
    // return items; // ... this way doesn't work..?
  };

  verifyValidEmail = async () => {
    const { users, email } = this.state;
    const { navigation } = this.props;
    const { navigate } = navigation;
    await users;
    // @ts-ignore
    for (let i = 0; i < users.length; i += 1) {
      if (email === users[i].email) {
        return navigate('Main', { email });
      }
    }
    return this.setState({ invalidEmailSubmitted: true });
  };

  InvalidMessage = () => {
    const { invalidEmailSubmitted, email } = this.state;
    // this.setState({ invalidEmailSubmitted: false });
    return (
      invalidEmailSubmitted
        ? (
          <Text>
            Sorry,
            {` '${email}' `}
            is an invalid email. Please provide a correct email to continue.
          </Text>
        )
        : (
          <Text />
        )
    );
  };

  render() {
    return (
      // @ts-ignore
      <View style={styles.container}>
        {/* eslint-disable-next-line */}
        <Text style={styles.paragraph}>Login</Text>
        <RkTextInput placeholder="email" onChangeText={email => this.setState({ email, invalidEmailSubmitted: false })} />
        <RkButton rkType="primary xlarge" onPress={() => this.verifyValidEmail()}>
          <Text>
            Login
          </Text>
        </RkButton>
        <this.InvalidMessage />
      </View>
    );
  }
}