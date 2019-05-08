/* eslint-disable camelcase */
import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Button,
  View,
  FlatList
} from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import makeCancelable from '../../utils/makeCancelable';
import { requestDB } from '../../services/Api';

/**
 * @author Riyad Shauk
 */
export default class MentionsScreen extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = {
    title: 'My Mentions'
  };

  state = {
    commentsUserIsMentionedIn: [],
    fetchMentionsRequest: undefined,
    isFetching: false,
    club: {}
  };

  async componentDidMount() {
    this.setState({ isFetching: true });
    this.setState({ fetchMentionsRequest: await this.fetchMentions() });
    this.setState({ isFetching: false });
  }

  /**
   * @see https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component/
   * @see https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
   */
  componentWillUnmount() {
    if (
      this.state.fetchMentionsRequest &&
      this.state.fetchMentionsRequest.cancel instanceof Function
    ) {
      this.state.fetchMentionsRequest.cancel();
    }
  }

  fetchMentions = () => {
    return makeCancelable(
      new Promise(async (resolve, reject) => {
        try {
          const user_id = await AsyncStorage.getItem('user_id');
          const getUserMentionedComments = `
            SELECT *
            FROM "club_comments"
            INNER JOIN "mentions"
            ON "club_comments"."id" = "mentions"."comment_id"
            WHERE "mentions"."mentionee_id" = ${user_id}
          `
            .replace(/\s+/g, ' ')
            .trim();
          const commentsUserIsMentionedIn =
            (await requestDB({
              method: 'sql',
              sql: getUserMentionedComments
            })).items || [];
          const club = {};
          // eslint-disable-next-line no-return-assign
          commentsUserIsMentionedIn.forEach(
            comment => (club[comment.club_id] = true)
          );
          const clubIDs = Object.keys(club);
          clubIDs.forEach(async club_id => {
            const queryClubNames = `
              SELECT "name"
              FROM "club_name"
              WHERE "club_name"."id" = ${club_id}
            `
              .replace(/\s+/g, ' ')
              .trim();
            const [{ name }] = (await requestDB({
              method: 'sql',
              sql: queryClubNames
            })).items;
            this.setState(prevState => ({
              club: { ...prevState.club, [club_id]: name }
            }));
          });
          this.setState({ commentsUserIsMentionedIn });
          resolve(commentsUserIsMentionedIn);
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };

  onRefresh = async () => {
    this.setState({ isFetching: true });
    this.setState({ fetchMentionsRequest: await this.fetchMentions() });
    this.setState({ isFetching: false });
  };

  render() {
    const { isFetching } = this.state;
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        {isFetching ? <ActivityIndicator /> : undefined}
        <FlatList
          data={this.state.commentsUserIsMentionedIn.map(commentRow => {
            const { comment, club_id, movie_id, id } = commentRow;
            return {
              key: `
                [${this.state.club[club_id] || '...'}]
                ${comment.substring(0, 30)}${comment.length > 30 ? '...' : ''}
              `
                .replace(/\s+/g, ' ')
                .trim(),
              club_id,
              movie_id,
              comment_id: id
            };
          })}
          onRefresh={() => this.onRefresh()}
          refreshing={isFetching}
          renderItem={({ item }) => (
            <Button
              title={item.key}
              onPress={() => {
                navigate('ClubThread', {
                  clubName: item.key,
                  club_id: item.club_id,
                  movie_id: item.movie_id,
                  comment_id: item.comment_id
                });
              }}
            />
          )}
        />
      </View>
    );
  }
}
