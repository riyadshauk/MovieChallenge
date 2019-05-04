import React, { Component, Fragment } from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  View,
  Text,
  FlatList
} from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import makeCancelable from '../../utils/makeCancelable';
import { requestDB } from '../../services/Api';

/**
 * @author Riyad Shauk
 */
export default class CreateClubScreen extends Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = {
    title: 'All Clubs'
  };

  state = {
    clubNames: [],
    clubNameToClubID: [],
    fetchClubsRequest: undefined,
    userHasJoinedClub: {},
    clubRequestLoading: {}
  };

  async componentDidMount() {
    const { getParam } = this.props.navigation;
    const clubNamesUserHasJoined = getParam('clubNames');
    const userHasJoinedClub = {};
    clubNamesUserHasJoined.forEach(clubName => {
      userHasJoinedClub[clubName.name] = true;
    });
    this.setState({
      userHasJoinedClub,
      fetchClubsRequest: await this.fetchClubs()
    });
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
          const clubs = (await requestDB({ method: 'get', table: 'club' }))
            .items;
          const clubNames = (await requestDB({
            method: 'get',
            table: 'club_name'
          })).items;
          const clubNameToClubID = {};
          clubNames.forEach(({ name, id }) => {
            clubs.forEach(club => {
              if (club.clubname_id === id) {
                clubNameToClubID[name] = id;
              }
            });
          });
          this.setState({
            clubNames,
            clubNameToClubID
          });
          resolve(clubs);
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };

  /**
   * @todo this currently assumes each clubName is unique... Is that a good assumption?
   * use club.id instead?
   */
  joinClub = async clubName => {
    this.setState(prevState => ({
      clubRequestLoading: { ...prevState.clubRequestLoading, [clubName]: true }
    }));
    const { getItem } = AsyncStorage;
    const { clubNameToClubID } = this.state;
    const addRecipientToClubRequest = `
      INSERT INTO "club_request" ("sender_id", "recipient_id", "club_id")
      VALUES (${Number(0)}, ${Number(await getItem('user_id'))}, ${
      clubNameToClubID[clubName]
    })
    `
      .replace(/\s+/g, ' ')
      .trim();
    await requestDB({ method: 'sql', sql: addRecipientToClubRequest });
    this.setState(prevState => ({
      userHasJoinedClub: { ...prevState.userHasJoinedClub, [clubName]: true },
      clubRequestLoading: { ...prevState.clubRequestLoading, [clubName]: false }
    }));
  };

  /**
   * @todo this currently assumes each clubName is unique... Is that a good assumption?
   * use club.id instead?
   */
  leaveClub = async clubName => {
    this.setState(prevState => ({
      clubRequestLoading: { ...prevState.clubRequestLoading, [clubName]: true }
    }));
    const { getItem } = AsyncStorage;
    const { clubNameToClubID } = this.state;
    const removeRecipientFromClubRequest = `
      DELETE FROM "club_request"
      WHERE "club_request"."recipient_id" = ${Number(await getItem('user_id'))}
      AND "club_request"."club_id" = ${clubNameToClubID[clubName]}
    `
      .replace(/\s+/g, ' ')
      .trim();
    await requestDB({ method: 'sql', sql: removeRecipientFromClubRequest });
    this.setState(prevState => ({
      userHasJoinedClub: { ...prevState.userHasJoinedClub, [clubName]: false },
      clubRequestLoading: { ...prevState.clubRequestLoading, [clubName]: false }
    }));
  };

  MembershipOptions = ({ clubName }) => {
    const { userHasJoinedClub, clubRequestLoading } = this.state;
    if (!clubRequestLoading[clubName]) {
      if (userHasJoinedClub[clubName]) {
        return (
          <Button title="Leave" onPress={() => this.leaveClub(clubName)} />
        );
      }
      return <Button title="Join" onPress={() => this.joinClub(clubName)} />;
    }
    return <ActivityIndicator />;
  };

  render() {
    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.clubNames.map(clubName => ({ key: clubName.name }))}
          renderItem={({ item }) => (
            <Fragment>
              <Text style={styles.item}>{item.key}</Text>
              <this.MembershipOptions clubName={item.key} />
            </Fragment>
          )}
        />
      </View>
    );
  }
}
