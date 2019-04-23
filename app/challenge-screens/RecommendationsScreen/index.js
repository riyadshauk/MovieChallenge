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

import request, { requestRecommendationAPI } from '../../services/Api';
import MovieListScreen from '../../screens/MovieListScreen';

import config from '../../../config';
import makeCancelable from '../../utils/makeCancelable';

/**
 * @author Riyad Shauk
 */
export default class RecommendationsScreen extends MovieListScreen {
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
      fetchMovieRecommendationsRequest: undefined,
      fetchRecommendedMoviesRequest: undefined
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
      this.state.fetchMovieRecommendationsRequest &&
      this.state.fetchMovieRecommendationsRequest.cancel instanceof Function
    ) {
      this.state.fetchMovieRecommendationsRequest.cancel();
    }
    // @ts-ignore
    if (
      this.state.fetchRecommendedMoviesRequest &&
      this.state.fetchRecommendedMoviesRequest.cancel instanceof Function
    ) {
      // @ts-ignore
      this.state.fetchRecommendedMoviesRequest.cancel();
    }
  }

  fetchRecommendedMovies = () => {
    return makeCancelable(
      new Promise(async resolve => {
        this.setState({
          fetchMovieRecommendationsRequest: this.fetchMovieRecommendations()
        });
        const challengeList = await (await this.state
          .fetchMovieRecommendationsRequest).promise;
        challengeList.forEach(async (challengeMovie, idx) => {
          const movieData = await request(`movie/${challengeMovie.movieID}`);
          const updatedChallengeMovie = {
            ...movieData,
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
      fetchRecommendedMoviesRequest: this.fetchRecommendedMovies()
    });
    // eslint-disable-next-line react/no-access-state-in-setstate
    const movies = await (await this.state.fetchRecommendedMoviesRequest)
      .promise;
    this.setState({
      isLoading: false,
      isLoadingMore: false,
      isError: false,
      results: movies
    });
  };

  fetchMovieRecommendations = async () => {
    return makeCancelable(
      new Promise(async (resolve, reject) => {
        const options = {
          method: 'get',
          headers: config.headers,
          json: true
        };
        try {
          const data = await requestRecommendationAPI(
            `recommendations?user_id=${this.state.currentUserID}`,
            options
          );
          // @todo
          // resolve(this.filterChallenges(items));
          resolve(data);
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };
}
