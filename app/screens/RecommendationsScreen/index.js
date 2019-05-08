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
import MovieListScreen from '../MovieListScreen';

import makeCancelable from '../../utils/makeCancelable';
import MovieRow from '../../components/cards/rows/MovieRow';

/**
 * @author Riyad Shauk
 */
export default class RecommendationsScreen extends MovieListScreen {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: 'Recommendations',
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
      currentUserID: await AsyncStorage.getItem('user_id')
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

  renderItem = (item, type, isSearch, numColumns, navigate) => {
    const { id, movieID, senderName, title } = item;
    return (
      <TouchableOpacity
        onPress={async () =>
          navigate('MovieDetails', {
            id: movieID || id,
            senderName,
            title
          })
        }
      >
        <MovieRow
          item={item}
          type={type}
          isSearch={isSearch}
          numColumns={numColumns}
          navigate={navigate}
        />
      </TouchableOpacity>
    );
  };

  fetchRecommendedMovies = () => {
    return makeCancelable(
      new Promise(async resolve => {
        this.setState({
          fetchMovieRecommendationsRequest: this.fetchMovieRecommendations()
        });
        const movieIDs = await (await this.state
          .fetchMovieRecommendationsRequest).promise;
        movieIDs.forEach(async (movieID, idx) => {
          const movieData = await request(`movie/${movieID}`);
          const updatedMovieData = {
            ...movieData,
            id: movieID
          };
          movieIDs[idx] = updatedMovieData;
          if (movieIDs.length - 1 === idx) {
            resolve(movieIDs);
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
        try {
          const { payload } = await requestRecommendationAPI(
            `recommendations?user_id=${this.state.currentUserID}`,
            { method: 'get' }
          );
          resolve(payload);
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };
}
