import React from 'react';
import { Asset } from 'expo';

import { Feather } from '@expo/vector-icons';
import { Assets as StackAssets } from 'react-navigation-stack';

import { TouchableOpacity } from '../../components/common/TouchableOpacity';

import { getItem } from '../../utils/AsyncStorage';
import { darkBlue } from '../../styles/Colors';

import styles from './styles';

import MovieListScreen from '../../screens/MovieListScreen';

import config from '../../../config';

export default class ChallengeList extends MovieListScreen {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      headerRight: (
        <TouchableOpacity
          style={styles.buttonFilter}
          onPress={params.actionFilter}
        >
          <Feather name="filter" size={23} color={darkBlue} />
        </TouchableOpacity>
      )
    };
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      challengeList: [],
      email: '',
      currentUserID: 2
    };
  }

  async componentDidMount() {
    try {
      const { navigation } = this.props;

      Asset.loadAsync(StackAssets);
      navigation.setParams({ actionFilter: this.actionFilter });

      const hasAdultContent = await getItem('@ConfigKey', 'hasAdultContent');

      this.setState(
        {
          hasAdultContent,
          email: navigation.getParam(
            'email',
            'no-email-address-found@example.com'
          )
        },
        () => {
          this.requestMoviesList();
        }
      );
    } catch (error) {
      this.requestMoviesList();
    }
  }

  updateResults = async () => {
    return new Promise(resolve => {
      this.state.results.forEach(async (challenge, idx) => {
        const movieData = await fetch(
          `https://api.themoviedb.org/3/movie/${
            challenge.movieID
          }?api_key=024d69b581633d457ac58359146c43f6`
        );
        const updatedChallenge = {
          ...challenge,
          ...(await movieData.json())
        };
        this.state.results[idx] = updatedChallenge;
        if (this.state.results.length - 1 === idx) {
          resolve();
        }
      });
    });
  };

  requestMoviesList = async () => {
    try {
      this.setState({ isLoading: true });

      // get all the challenges for the user
      await this.getChallengeList();

      // loop through each challenge and get each movie detail from tmdb
      // for await (let challenge of this.state.results) {

      await this.updateResults();

      // }

      this.setState(({ isRefresh }) => ({
        isLoading: false,
        isRefresh,
        isLoadingMore: false,
        isError: false
      }));
    } catch (err) {
      this.setState({
        isLoading: false,
        isRefresh: false,
        isLoadingMore: false,
        isError: true
      });
    }
  };

  // api call to get all the challenges
  getChallengeList = async () => {
    const options = {
      method: 'get',
      headers: config.headers,
      json: true
    };

    const response = await fetch(
      `${config.baseURL} /mobile/custom/Ash_SKy/ChallengeList`,
      options
    );
    const responseJson = await response.json();

    // challengeList - find the challenges for the logged in user
    if (responseJson !== null || responseJson !== undefined) {
      await this.getUserChallenges(responseJson);
    }
  };

  // filter to get the specific user challenges
  getUserChallenges = challengeJson => {
    const { currentUserID } = this.state;

    // loop through all the challenges to find the list for currentUser
    challengeJson.items.forEach(async item => {
      if (currentUserID === item.recipientID && !item.accepted)
        // results.push(item);
        this.setState(prevState => ({
          ...prevState,
          results: [...prevState.results, item]
        }));
    });
  };
}
