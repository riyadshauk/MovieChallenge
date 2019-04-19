import React from 'react';
import { Asset } from 'expo';

import { AsyncStorage } from 'react-native';

import { Feather } from '@expo/vector-icons';
// @ts-ignore
import { Assets as StackAssets } from 'react-navigation-stack';

import { TouchableOpacity } from '../../components/common/TouchableOpacity';

import { getItem } from '../../utils/AsyncStorage';
import { darkBlue } from '../../styles/Colors';

import styles from './styles';

import MovieListScreen from '../../screens/MovieListScreen';

import config from '../../../config';
import makeCancelable from '../../utils/makeCancelable';

/**
 * @author Darshan Sapaliga
 * @author Riyad Shauk
 */
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
      email: '',
      currentUserID: undefined,
      fetchChallengeListRequest: undefined,
      fetchChallengeMoviesRequest: undefined
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    Asset.loadAsync(StackAssets);
    navigation.setParams({ actionFilter: this.actionFilter });
    const hasAdultContent = await getItem('@ConfigKey', 'hasAdultContent');
    this.setState({
      hasAdultContent,
      email: navigation.getParam('email', 'no-email-address-found@example.com'),
      currentUserID: await AsyncStorage.getItem('userID')
    });
    this.createMoviesList();
  }

  /**
   * @see https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component/
   * @see https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
   */
  componentWillUnmount() {
    if (
      this.state.fetchChallengeListRequest &&
      this.state.fetchChallengeListRequest.cancel instanceof Function
    ) {
      this.state.fetchChallengeListRequest.cancel();
    }
    // @ts-ignore
    if (
      this.state.fetchChallengeMoviesRequest &&
      this.state.fetchChallengeMoviesRequest.cancel instanceof Function
    ) {
      // @ts-ignore
      this.state.fetchChallengeMoviesRequest.cancel();
    }
  }

  fetchChallengeMovies = () => {
    return makeCancelable(
      new Promise(async resolve => {
        this.setState({ fetchChallengeListRequest: this.fetchChallengeList() });
        const challengeList = await (await this.state.fetchChallengeListRequest)
          .promise;
        challengeList.forEach(async (challengeMovie, idx) => {
          const movieData = await fetch(
            `https://api.themoviedb.org/3/movie/${
              challengeMovie.movieID
            }?api_key=024d69b581633d457ac58359146c43f6`
          );
          const updatedChallengeMovie = {
            ...(await movieData.json()),
            ...challengeMovie
          };
          challengeList[idx] = updatedChallengeMovie;
          if (challengeList.length - 1 === idx) {
            resolve(challengeList);
          }
        });
      })
    );
  };

  createMoviesList = async () => {
    this.setState({
      isLoading: true,
      fetchChallengeMoviesRequest: this.fetchChallengeMovies()
    });
    // eslint-disable-next-line react/no-access-state-in-setstate
    const movies = await (await this.state.fetchChallengeMoviesRequest).promise;
    this.setState({
      isLoading: false,
      isLoadingMore: false,
      isError: false,
      results: movies
    });
  };

  fetchChallengeList = async () => {
    return makeCancelable(
      new Promise(async (resolve, reject) => {
        const options = {
          method: 'get',
          headers: config.headers,
          json: true
        };
        try {
          const response = await (await fetch(
            `${config.baseURL} /mobile/custom/Ash_SKy/ChallengeList`,
            options
          )).json();
          resolve(this.filterChallenges(response.items));
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };

  filterChallenges = challenges => {
    const { currentUserID } = this.state;
    const seen = {};
    return challenges.filter(challenge => {
      // filter out duplicate challenges (same movie from multiple users)
      // if (seen[challenge.id]) {
      //   return false;
      // }
      seen[challenge.id] = true;
      // filter out challenges that aren't intended for the current user
      // eslint-disable-next-line eqeqeq
      return currentUserID == challenge.recipientID && !challenge.accepted;
    });
  };
}
