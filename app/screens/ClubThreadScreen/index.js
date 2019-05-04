/* eslint-disable camelcase */
import React, { Component, Fragment } from 'react';
import { AsyncStorage, Button, FlatList, Text, View } from 'react-native';
import { RkTextInput, RkButton } from 'react-native-ui-kitten';
import PropTypes from 'prop-types';

import styles from './styles';
import makeCancelable from '../../utils/makeCancelable';
import request, { requestDB } from '../../services/Api';

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
    isFetching: false
  };

  async componentDidMount() {
    this.setState({ fetchMovieDataRequest: await this.fetchMovieData() });
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

  // @todo extract in separate component?
  postComment = async () => {
    const { getParam } = this.props.navigation;
    const { getItem } = AsyncStorage;
    const comment = {
      club_id: Number(getParam('club_id', '0')),
      user_id: Number(await getItem('user_id')),
      parent_comment_id: Number(0),
      comment: this.state.currentComment,
      movie_id: Number(this.state.currentCommentMovie)
    };
    const response = await requestDB({
      method: 'insert',
      table: 'club_comments',
      object: comment
    });
    // @todo handle errors more purposefully?
    comment.id = response.id;
    this.state.movieToComments[this.state.currentCommentMovie].push(comment);
    this.forceUpdate();
  };

  onRefresh = async () => {
    this.setState({ isFetching: true });
    this.setState({ fetchMovieDataRequest: await this.fetchMovieData() });
    this.setState({ isFetching: false });
  };

  render() {
    const { isFetching, movieToComments, selectedMovies } = this.state;
    const { getParam, navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <Button
          title="Add/Remove Movie"
          onPress={async () =>
            navigate('BrowseMoviesForClub', {
              club_id: getParam('club_id', '0'),
              clubName: getParam('clubName')
            })
          }
        />
        <FlatList
          data={this.state.movieData.map(movie => ({
            key: movie.title,
            id: movie.id
          }))}
          onRefresh={() => this.onRefresh()}
          refreshing={isFetching}
          renderItem={({ item }) => (
            <Fragment>
              <Button
                title={item.key}
                onPress={() => {
                  if (this.state.selectedMovies.hasOwnProperty(item.id)) {
                    this.setState(prevState => ({
                      selectedMovies: {
                        ...prevState.selectedMovies,
                        [item.id]: !prevState.selectedMovies[item.id]
                      }
                    }));
                  } else {
                    this.setState(prevState => ({
                      selectedMovies: {
                        ...prevState.selectedMovies,
                        [item.id]: true
                      }
                    }));
                  }
                }}
              />
              {// @todo extract to separate component?
              selectedMovies[item.id] ? (
                <Fragment>
                  {movieToComments[item.id].map(comment => (
                    <Text key={comment.id}>
                      {`user${comment.user_id}: ${comment.comment}`}
                    </Text>
                  ))}
                  <RkTextInput
                    placeholder="comment"
                    onChangeText={currentComment =>
                      this.setState({
                        currentComment,
                        currentCommentMovie: item.id
                      })
                    }
                    autoCapitalize="none"
                  />
                  <RkButton
                    rkType="primary xlarge"
                    onPress={() => this.postComment()}
                  >
                    <Text>Send</Text>
                  </RkButton>
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
