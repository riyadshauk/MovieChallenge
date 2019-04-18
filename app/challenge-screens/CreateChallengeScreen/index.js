import React from 'react';
import { AsyncStorage, Text, View } from 'react-native';
import PropTypes from 'prop-types';

// import config from '../../../config';
import styles from './styles';

// const { headers } = config;

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
    email: undefined
  };

  async componentDidMount() {
    this.setState({
      movieID: this.props.navigation.getParam('movieID', 'defaultMovieID'),
      userID: await AsyncStorage.getItem('userID'),
      email: await AsyncStorage.getItem('email')
    });
  }

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
      </View>
    );
  }
}
