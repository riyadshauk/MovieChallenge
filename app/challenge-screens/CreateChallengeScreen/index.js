import React from 'react';
import { View, Text } from 'react-native';
// import PropTypes from 'prop-types';

// import config from '../../../config';
import styles from './styles';

// const { headers } = config;

/**
 * @author Riyad Shauk
 */
export default class CreateChallengeScreen extends React.Component {
  // static propTypes = {
  //   // eslint-disable-next-line react/forbid-prop-types
  //   navigation: PropTypes.object.isRequired,
  //   movieID: PropTypes.string.isRequired
  // };

  static navigationOptions = {
    title: 'Create a Challenge!'
  };

  // state = {
  //   movieID: undefined
  // };

  // componentDidMount() {
  //   this.setState({ movieID: this.props.movieID });
  // }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Create Challenge form here</Text>
      </View>
    );
  }
}
