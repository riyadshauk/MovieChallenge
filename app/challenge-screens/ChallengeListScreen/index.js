import React from 'react';
import { Asset } from 'expo';

import { Feather } from '@expo/vector-icons';
import { Assets as StackAssets } from 'react-navigation-stack';

import { TouchableOpacity } from '../../components/common/TouchableOpacity';

import { getItem } from '../../utils/AsyncStorage';
import { darkBlue } from '../../styles/Colors';

import styles from './styles';

import request from '../../services/Api';
import MovieListScreen from '../../screens/MovieListScreen';

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
      email: ''
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

  requestMoviesList = async () => {
    try {
      this.setState({ isLoading: true });

      const { page, filterType, hasAdultContent } = this.state;
      const dateRelease = new Date().toISOString().slice(0, 10);

      // get all the challenges for the user
      await getChallengeList();

      // loop through each challenge and get each movie detail from tmdb
      // this.state.challengeList.forEach(challenge => {

      // });

      const data = await request('discover/movie', {
        page,
        'release_date.lte': dateRelease,
        sort_by: filterType,
        with_release_type: '1|2|3|4|5|6|7',
        include_adult: hasAdultContent
      });

      // console.log('------------------------------------------');
      // console.log(data);

      this.setState(({ isRefresh, results }) => ({
        isLoading: false,
        isRefresh: false,
        isLoadingMore: false,
        isError: false,
        totalPages: data.total_pages,
        results: isRefresh ? data.results : [...results, ...data.results]
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

    // console.log(options);
    const response = await fetch(
      `${config.baseURL} /mobile/custom/Ash_SKy/ChallengeList`,
      options
    );
    const responseJson = await response.json();

    // challengeList - find the challenges for the logged in user
    if (responseJson == null || responseJson === undefined) {
      await AsyncStorage.setItem('largestChallengeId', '1');
      // console.log('No data returned');
    } else {
      // console.log('data returned', responseJson);
      await this.getUserChallenges(responseJson);
    }
  };

  // filter to get the specific user challenges
  getUserChallenges = challengeJson => {
    const { email, challengeList } = this.state;

    // loop through all the challenges to find the list for currentUser
    challengeJson.items.forEach(async item => {
      if (largest < item.challengeid) {
        largest = item.challengeid;
      }

      if (email === item.challengerid && item.status === 0) {
        // call to get the challenger user (I think so)
        const getuserurl = `${config.baseURL} /mobile/custom/Ash_SKy/GetUser/ ${
          item.userid
        }`;
        const options = {
          method: 'GET',
          json: true,
          headers
        };
        const response = await fetch(getuserurl, options);
        const responseJson = response.json();

        // eslint-disable-next-line no-param-reassign
        item.email = responseJson.items[0].email;
        console.log(item);

        // update challengelist for currentUser
        challengeList.push(item);
      }
    });
  };
}
