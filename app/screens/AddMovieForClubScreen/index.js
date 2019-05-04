/* eslint-disable camelcase */
import React, { Component } from 'react';
import { ActivityIndicator, AsyncStorage, Button, View } from 'react-native';
import PropTypes from 'prop-types';

import styles from './styles';
import { requestDB } from '../../services/Api';

/**
 * @author Riyad Shauk
 */
// @ts-ignore
export default class AddMovieForClubScreen extends Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = {
    title: 'Add/Remove Movie'
  };

  state = {
    userHasAddedMovie: false,
    isAddingMovie: false,
    title: '',
    clubName: ''
  };

  async componentDidMount() {
    const { getParam } = this.props.navigation;
    this.setState({
      title: getParam('title'),
      clubName: getParam('clubName'),
      userHasAddedMovie: await this.checkIfMovieWasPreviouslyAdded()
    });
  }

  whereMovieInClub = async () => {
    const { getParam } = this.props.navigation;
    const movie_id = getParam('id');
    const club_id = getParam('club_id');
    return `
      WHERE "club_comments"."club_id" = ${club_id}
      AND "club_comments"."movie_id" = ${movie_id}
    `;
  };

  checkIfMovieWasPreviouslyAdded = async () => {
    const queryMovieInClub = `
      SELECT COUNT(*) AS "movieInClub"
      FROM "club_comments"
      ${await this.whereMovieInClub()}
    `
      .replace(/\s+/g, ' ')
      .trim();
    const [{ movieInClub }] = (await requestDB({
      method: 'sql',
      sql: queryMovieInClub
    })).items;
    // eslint-disable-next-line eqeqeq
    return movieInClub == true;
  };

  addMovie = async () => {
    const { getParam } = this.props.navigation;
    const { getItem } = AsyncStorage;
    const movie_id = getParam('id');
    const club_id = getParam('club_id');
    const user_id = await getItem('user_id');
    const time = new Date().toISOString();
    const addMovieToClub = `
      INSERT INTO "club_comments" ("club_id", "user_id", "parent_comment_id", "comment", "movie_id", "time")
      VALUES (${club_id}, ${user_id}, 0, 'First comment (by user${user_id})!', ${movie_id}, '${time}')
    `
      .replace(/\s+/g, ' ')
      .trim();
    await requestDB({ method: 'sql', sql: addMovieToClub });
    this.setState({ userHasAddedMovie: true });
  };

  /**
   * Removes this movie from this club iff numComments < 2
   * (eg, only a sentinel comment has been created for this movie in this club).
   */
  removeMovie = async () => {
    const whereMovieInClub = this.whereMovieInClub();
    const retrieveNumCommentsForMovie = `
      SELECT COUNT(*) AS "numComments"
      FROM "club_comments"
      ${whereMovieInClub}
    `
      .replace(/\s+/g, ' ')
      .trim();
    const [{ numComments }] = (await requestDB({
      method: 'sql',
      sql: retrieveNumCommentsForMovie
    })).items;
    if (numComments < 2) {
      const removeMovieFromClub = `
        DELETE FROM "club_comments"
        ${whereMovieInClub}
      `
        .replace(/\s+/g, ' ')
        .trim();
      await requestDB({ method: 'sql', sql: removeMovieFromClub });
      this.setState({ userHasAddedMovie: false });
    }
  };

  AddMovieOption = () => {
    const { userHasAddedMovie, isAddingMovie } = this.state;
    if (!userHasAddedMovie) {
      return (
        <Button
          title={`Add ${this.state.title || 'title'} to ${this.state.clubName ||
            'club'}`}
          onPress={() => this.addMovie()}
        />
      );
    }
    if (isAddingMovie) {
      return <ActivityIndicator />;
    }
    return (
      <Button
        title={`Remove ${this.state.title || 'title'} from ${this.state
          .clubName || 'club'}`}
        onPress={() => this.removeMovie()}
      />
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <this.AddMovieOption />
      </View>
    );
  }
}
