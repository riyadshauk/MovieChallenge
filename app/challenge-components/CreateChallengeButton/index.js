import React from 'react';
import { Button } from 'react-native';

// import styles from './styles';

const navigateToCreateChallengeScreen = (movieID, navigate) => {
  navigate('CreateChallenge', { movieID });
};

const CreateChallengeButton = props => {
  const { movieID, navigate } = props;
  return (
    <Button
      movieID={props.movieID}
      title="Challenge a buddy!"
      onPress={() => navigateToCreateChallengeScreen(movieID, navigate)}
    />
  );
};

export default CreateChallengeButton;
