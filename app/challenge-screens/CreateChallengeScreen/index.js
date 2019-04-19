import React from 'react';
import { AsyncStorage, Picker, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { RkButton } from 'react-native-ui-kitten';

import config from '../../../config';
import styles from './styles';
import makeCancelable from '../../utils/makeCancelable';

const { headers } = config;

/**
 * @author Riyad Shauk
 */
export default class CreateChallengeScreen extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = {
    title: 'Create a Challenge!'
  };

  state = {
    movieID: undefined,
    userID: undefined,
    email: undefined,
    users: [],
    fetchUsersRequest: undefined,
    selectedUserID: undefined,
    userChallenged: false,
    createChallengeRequest: undefined
  };

  async componentDidMount() {
    this.setState({
      movieID: this.props.navigation.getParam('movieID', 'defaultMovieID'),
      userID: await AsyncStorage.getItem('userID'),
      email: await AsyncStorage.getItem('email'),
      fetchUsersRequest: this.fetchUsers()
    });
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
          items.forEach(user => {
            // eslint-disable-next-line no-param-reassign
            user.name = user.email
              .replace(/@.*/, '')
              .split('.')
              .map(name => name[0].toUpperCase() + name.substring(1))
              .join(' ');
          });
          items.sort((a, b) => (a.name > b.name ? 1 : -1));
          this.setState({ users: items });
          resolve(items);
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };

  createChallenge = () => {
    return makeCancelable(
      new Promise(async (resolve, reject) => {
        const { userID, movieID } = this.state;
        const body = {
          // @todo
          userID,
          movieID,
          recipientID: this.state.selectedUserID,
          accepted: false
        };
        const options = {
          method: 'post',
          headers: {
            ...headers,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        };
        try {
          const response = await (await fetch(
            `${config.baseURL}/mobile/custom/Ash_SKy/ChallengePostList`,
            options
          )).json();
          this.setState({ userChallenged: true });
          resolve(response);
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Create Challenge form here</Text>
        <Text>
          movieID:
          {` ${this.state.movieID}`}
        </Text>
        <Text>
          current userID:
          {` ${this.state.userID}`}
        </Text>
        <Text>
          current email:
          {` ${this.state.email}`}
        </Text>

        <Text>Choose a user to challenge!</Text>
        <Picker
          selectedValue={this.state.selectedUserID}
          style={styles.picker}
          onValueChange={selectedUserID =>
            this.setState({ selectedUserID, userChallenged: false })
          }
        >
          {this.state.users.map(user => (
            <Picker.Item key={user.id} label={user.name} value={user.id} />
          ))}
        </Picker>

        <RkButton
          style={
            {
              // marginTop: 200,
              // marginBottom: 0
              // bottom: 0
            }
          }
          rkType="xlarge"
          onPress={() =>
            this.setState({ createChallengeRequest: this.createChallenge() })
          }
        >
          <Text>Challenge!</Text>
        </RkButton>
        {this.state.userChallenged ? (
          <Text>
            User
            {` ${
              this.state.users.find(
                user => user.id === this.state.selectedUserID
              ).name
            } `}
            successfully challenged!
          </Text>
        ) : (
          <Text />
        )}
      </View>
    );
  }
}
