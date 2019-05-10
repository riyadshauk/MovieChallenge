/* eslint-disable camelcase */
import React, { Component, Fragment } from 'react';
import {
  AsyncStorage,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RkTextInput, RkButton } from 'react-native-ui-kitten';
import PropTypes from 'prop-types';

import styles from './styles';
import makeCancelable from '../../utils/makeCancelable';
import request, {
  requestDB,
  requestRecommendationAPI
} from '../../services/Api';

/**
 * @author Riyad Shauk
 */
export default class ClubThreadScreen extends Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = ({ navigation }) => {
    const clubName = navigation.getParam('clubName', 'Club Thread');
    const maxLen = 100; // 21;
    const cleanedName =
      clubName.length > maxLen
        ? `${clubName.substring(0, maxLen - 3)}...`
        : clubName;
    return {
      title: cleanedName
    };
  };

  state = {
    fetchClubCommentsRequest: undefined,
    fetchMovieDataRequest: undefined,
    movieData: [],
    movieToComments: {},
    selectedMovies: {},
    currentComment: '',
    currentCommentMovie: undefined,
    isFetching: false,
    ratings: {}
    // selectedComment: undefined
  };

  async componentDidMount() {
    const { getParam } = this.props.navigation;
    const movie_id = getParam('movie_id');
    this.toggleMovieInSelection(movie_id);
    this.setState({
      // selectedComment: getParam('comment_id'),
      fetchMovieDataRequest: await this.fetchMovieData()
    });
  }

  /**
   * @see https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component/
   * @see https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
   */
  componentWillUnmount() {
    if (
      this.state.fetchClubCommentsRequest &&
      this.state.fetchClubCommentsRequest.cancel instanceof Function
    ) {
      this.state.fetchClubCommentsRequest.cancel();
    }
    if (
      this.state.fetchMovieDataRequest &&
      this.state.fetchMovieDataRequest.cancel instanceof Function
    ) {
      this.state.fetchMovieDataRequest.cancel();
    }
  }

  fetchClubComments = () => {
    return makeCancelable(
      new Promise(async (resolve, reject) => {
        try {
          const { getParam } = this.props.navigation;
          const joinCommentsOnClub = `
          SELECT *
          FROM "club_comments"
          WHERE "club_comments"."club_id" = ${getParam('club_id', '0')}`
            .replace(/\s+/g, ' ')
            .trim();
          const clubComments = (await requestDB({
            method: 'sql',
            sql: joinCommentsOnClub
          })).items;
          const movieToComments = {};
          clubComments.forEach(comment => {
            const { movie_id } = comment;
            if (!movieToComments.hasOwnProperty(movie_id)) {
              movieToComments[movie_id] = [];
            }
            movieToComments[movie_id].push(comment);
          });
          Object.values(movieToComments).forEach(comments =>
            comments.sort((a, b) => (a.id > b.id ? 1 : -1))
          );
          this.setState({ movieToComments });
          resolve(movieToComments);
        } catch (err) {
          reject(err.stack);
        }
      })
    );
  };

  fetchMovieData = () => {
    return makeCancelable(
      new Promise(async resolve => {
        const movieToComments = await (await this.fetchClubComments()).promise;
        this.setState({ movieData: [] }); // clear this.state.movieData to avoid duplicates
        // asynchronously update this.state.movieData
        Object.keys(movieToComments).forEach(async movie_id => {
          const movie = await request(`movie/${movie_id}`);
          this.setState(prevState => ({
            movieData: [...prevState.movieData, movie]
          }));
        });
        resolve();
      })
    );
  };

  extractAndPostMentions = async ({ user_id, comment }, commentID) => {
    /**
     * @see https://stackoverflow.com/questions/39576/best-way-to-do-multi-row-insert-in-oracle#answer-93724
     */
    const insertManyMentions = `${(comment.match(/(@user\d+)/g) || []).reduce(
      (acc, mention) =>
        `${acc} INTO "mentions" ("mentioner_id", "mentionee_id", "comment_id")
          VALUES (${user_id}, ${mention.replace(
          '@user',
          ''
        )}, ${commentID})`.replace(/\s+/g, ' '),
      `INSERT ALL`
    )} SELECT 1 FROM DUAL`;
    if (insertManyMentions === 'INSERT ALL SELECT 1 FROM DUAL') return;
    try {
      await requestDB({ method: 'sql', sql: insertManyMentions });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err && err.stack ? err.stack : err);
    }
  };

  // @todo extract in separate component?
  postComment = () => {
    return makeCancelable(
      new Promise(async resolve => {
        const { getParam } = this.props.navigation;
        const { getItem } = AsyncStorage;
        const comment = {
          club_id: Number(getParam('club_id', '0')),
          user_id: Number(await getItem('user_id')),
          parent_comment_id: Number(0),
          comment: this.state.currentComment,
          movie_id: Number(this.state.currentCommentMovie),
          time: new Date().toISOString()
        };
        try {
          /**
           * @note NOTE: using 'insert' from the databaseAccess Platform API on Oracle Mobile Hub
           * is not the same as writing an Oracle SQL query with an INSERT statement.
           */
          const insertComment = `
            INSERT INTO "club_comments" ("club_id", "user_id", "parent_comment_id", "comment", "movie_id", "time")
            VALUES (${comment.club_id}, ${comment.user_id}, ${
            comment.parent_comment_id
          }, '${comment.comment}', ${comment.movie_id}, '${comment.time}')
          `
            .replace(/\s+/g, ' ')
            .trim();
          await requestDB({ method: 'sql', sql: insertComment });
          /**
           * There seems to be a bug in the Database Access API on Oracle Mobile Hub.
           * For some reason, the response gives me a rowCount property, but doesn't
           * give me the rows inserted with the generated "id" column.
           * @see https://docs.oracle.com/en/cloud/paas/mobile-hub/develop/calling-apis-custom-code.html#GUID-C691A53F-CC59-4D0E-B225-E2F3411E3DB1
           * @see https://docs.oracle.com/en/cloud/paas/mobile-hub/develop/calling-apis-custom-code.html#GUID-13F8DCD4-2040-4A5F-9E23-0DC87C823DD6
           *
           * Instead, I'm using a PL/SQL query (since it uses the procedure `to_char`)
           * @see https://stackoverflow.com/questions/12980038/ora-00932-inconsistent-datatypes-expected-got-clob#31035525
           */
          const selectCommentID = `
            SELECT "id"
            FROM "club_comments"
            WHERE to_char("club_comments"."time") = '${comment.time}'
          `
            .replace(/\s+/g, ' ')
            .trim();
          const [{ id }] = (await requestDB({
            method: 'sql',
            sql: selectCommentID
          })).items;
          comment.id = id;
          this.extractAndPostMentions(comment, id);
          this.setState(prevState => ({
            movieToComments: {
              ...prevState.movieToComments,
              [prevState.currentCommentMovie]: [
                ...prevState.movieToComments[prevState.currentCommentMovie],
                comment
              ]
            }
          }));
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err && err.stack ? err.stack : err);
        }
        resolve();
      })
    );
  };

  onRefresh = async () => {
    this.setState({ isFetching: true });
    const { getItem } = AsyncStorage;
    const user_id = await getItem('user_id');
    this.fetchRatings(user_id);
    this.setState({ fetchMovieDataRequest: await this.fetchMovieData() });
    this.setState({ isFetching: false });
  };

  fetchRatings = async user_id => {
    return makeCancelable(
      new Promise(async resolve => {
        const userRatings = (await requestRecommendationAPI(
          `ratings?user_id=${user_id}`,
          { method: 'get' }
        )).payload;
        this.setState(prevState => ({
          ratings: {
            ...prevState.ratings,
            // @todo why can't async/await be used in here without an exception being thrown..?
            [user_id]: userRatings
          }
        }));
        resolve();
      })
    );
  };

  /**
   * Contrary to the notion of a 'getter' being purely functional:
   * This may have side-effects (by conditionally calling this.fetchRatings).
   */
  getRating = (user_id, movie_id) => {
    const userRatings = this.state.ratings[user_id];
    for (let i = 0; userRatings !== undefined && i < userRatings.length; i += 1)
      if (userRatings[i].movie_id === movie_id)
        return userRatings[i].user_rating;
    if (!this.state.ratings.hasOwnProperty(user_id))
      // async fetch ratings into this.state.ratings, eventually triggering a re-render
      this.fetchRatings(user_id);
    return -1;
  };

  /**
   * This does a bit more than merely displaying a rating...
   *
   * The first time this component is rendered with a unique user_id,
   * there will be no ratings yet fetched for that user_id,
   * so it will ultimately fetch any ratings for that user_id,
   * and will initially render no text.
   *
   * When this.state.ratings gets updated from the fetch,
   * it will re-render with a rating iff the user has posted a rating for movie_id.
   */
  DisplayRating = ({ user_id, movie_id }) => {
    const rating = this.getRating(user_id, movie_id);
    if (rating === -1) return <Text />;
    return <Text>{` | (rating: ${rating})`}</Text>;
  };

  MakeAComment = ({ movie_id }) => (
    <Fragment>
      <RkTextInput
        placeholder="comment"
        onChangeText={currentComment =>
          this.setState({
            currentComment,
            currentCommentMovie: movie_id
          })
        }
        autoCapitalize="none"
      />
      <RkButton rkType="primary xlarge" onPress={this.postComment}>
        <Text>Send</Text>
      </RkButton>
    </Fragment>
  );

  MovieThread = ({ movie_id }) => {
    const { movieToComments } = this.state;
    return (
      <Fragment>
        {movieToComments[movie_id].map(comment => (
          <Fragment key={String(comment.id)}>
            <Text style={styles.commentDate}>
              {`${new Date(comment.time)}`}
              <this.DisplayRating
                user_id={comment.user_id}
                movie_id={movie_id}
              />
            </Text>
            <Text style={styles.commentTextContainer}>
              <Text style={styles.commentUserName}>{`user${
                comment.user_id
              } `}</Text>
              <Text style={styles.commentText}>{comment.comment}</Text>
            </Text>
          </Fragment>
        ))}
        <this.MakeAComment movie_id={movie_id} />
      </Fragment>
    );
  };

  toggleMovieInSelection = movie_id => {
    if (this.state.selectedMovies.hasOwnProperty(movie_id)) {
      this.setState(prevState => ({
        selectedMovies: {
          ...prevState.selectedMovies,
          [movie_id]: !prevState.selectedMovies[movie_id]
        }
      }));
    } else {
      this.setState(prevState => ({
        selectedMovies: {
          ...prevState.selectedMovies,
          [movie_id]: true
        }
      }));
    }
  };

  render() {
    const { isFetching, selectedMovies } = this.state;
    const { getParam, navigate } = this.props.navigation;
    const [club_id, clubName] = [
      getParam('club_id', '0'),
      getParam('clubName')
    ];
    return (
      <View style={styles.container}>
        <Button
          title="Add/Remove Movie"
          onPress={() => navigate('BrowseMoviesForClub', { club_id, clubName })}
        />
        <FlatList
          data={this.state.movieData.map(({ title, id }) => ({
            key: title,
            id
          }))}
          onRefresh={() => this.onRefresh()}
          refreshing={isFetching}
          renderItem={({ item, index }) => (
            <Fragment>
              <TouchableOpacity
                onPress={() => this.toggleMovieInSelection(item.id)}
                style={{
                  ...styles.backgroundColor(index),
                  ...styles.movieTitle
                }}
              >
                <Text>{item.key}</Text>
              </TouchableOpacity>
              {selectedMovies[item.id] ? (
                <Fragment>
                  <TouchableOpacity
                    style={styles.movieDetails}
                    onPress={() => navigate('MovieDetails', { id: item.id })}
                  >
                    <Text>View details / rate movie</Text>
                  </TouchableOpacity>
                  <this.MovieThread movie_id={item.id} />
                </Fragment>
              ) : (
                undefined
              )}
            </Fragment>
          )}
        />
      </View>
    );
  }
}
