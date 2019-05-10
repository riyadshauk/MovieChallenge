import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  View,
  FlatList,
  Text,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import makeCancelable from '../../utils/makeCancelable';
import { requestDB } from '../../services/Api';

/**
 * @author Riyad Shauk
 */
export default class CreateClubScreen extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = {
    title: 'My Clubs'
  };

  state = {
    clubNames: [],
    fetchClubsRequest: undefined,
    isFetching: false
  };

  async componentDidMount() {
    this.setState({ isFetching: true });
    this.setState({ fetchClubsRequest: await this.fetchClubs() });
    this.setState({ isFetching: false });
    this.setState({ user_id: await AsyncStorage.getItem('user_id') });
  }

  /**
   * @see https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component/
   * @see https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
   */
  componentWillUnmount() {
    if (
      this.state.fetchClubsRequest &&
      this.state.fetchClubsRequest.cancel instanceof Function
    ) {
      this.state.fetchClubsRequest.cancel();
    }
  }

  fetchClubs = () => {
    return makeCancelable(
      new Promise(async (resolve, reject) => {
        try {
          if (this.state.user_id === undefined) {
            // eslint-disable-next-line camelcase
            const user_id = await AsyncStorage.getItem('user_id');
            this.setState({ user_id });
          }
          const getMyClubs = `
            SELECT * FROM "club_name"
            INNER JOIN "club_request"
            ON "club_name"."id" = "club_request"."club_id"
            AND "club_request"."recipient_id" = ${this.state.user_id}
          `
            .replace(/\s+/g, ' ')
            .trim();
          const clubNames = (await requestDB({
            method: 'sql',
            sql: getMyClubs
          })).items;
          this.setState({ clubNames });
          resolve(clubNames);
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };

  onRefresh = async () => {
    this.setState({ isFetching: true });
    this.setState({ fetchClubsRequest: await this.fetchClubs() });
    this.setState({ isFetching: false });
  };

  render() {
    const { clubNames, isFetching } = this.state;
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.explore}
          onPress={() => navigate('JoinClub', { clubNames })}
        >
          <Text>Explore Clubs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.create}
          onPress={() => navigate('CreateClub', {})}
        >
          <Text>Create a Club</Text>
        </TouchableOpacity>
        {isFetching ? <ActivityIndicator /> : undefined}
        <FlatList
          data={this.state.clubNames.map(clubName => ({
            key: clubName.name,
            club_id: clubName.club_id
          }))}
          onRefresh={() => this.onRefresh()}
          refreshing={isFetching}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => {
                navigate('ClubThread', {
                  clubName: item.key,
                  club_id: item.club_id
                });
              }}
              style={{ ...styles.backgroundColor(index), ...styles.movieTitle }}
            >
              <Text>{item.key}</Text>
            </TouchableOpacity>
          )}
          style={styles.flatlist}
        />
      </View>
    );
  }
}
