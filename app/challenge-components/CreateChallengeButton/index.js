import React from 'react';
import { Button } from 'react-native';

// import styles from './styles';

/**
 * @todo
 * @see https://reactnavigation.org/docs/en/navigating-without-navigation-prop.html
 */
// const navigateToCreateChallengeScreen = (movieID, navigate) => {
//   // navigate('CreateChallenge', { movieID });
//   console.log('CreateChallengeButton pressed, movieID:', movieID);
// }

const CreateChallengeButton = props => {
  // const {
  //   movieID
  //   // navigation
  // } = props;
  return (
    <Button
      movieID={props.movieID}
      title="Challenge a buddy!"
      // onPress={() => navigateToCreateChallengeScreen(movieID, /* navigation.navigate */)}
    />
  );
};

export default CreateChallengeButton;
