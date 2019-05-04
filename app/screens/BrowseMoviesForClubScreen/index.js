import React from 'react';
import PropTypes from 'prop-types';

import MovieListScreen from '../MovieListScreen';
import { TouchableOpacity } from '../../components/common/TouchableOpacity';
import MovieRow from '../../components/cards/rows/MovieRow';

/**
 * @author Riyad Shauk
 */
// @ts-ignore
export default class BrowseMoviesForClubScreen extends MovieListScreen {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  };

  static navigationOptions = {
    title: 'Browse Movies for Club'
  };

  renderItem = (item, type, isSearch, numColumns, navigate) => {
    const { id, movieID, senderName, title } = item;
    const { getParam } = this.props.navigation;
    return (
      <TouchableOpacity
        onPress={async () =>
          navigate('AddMovieForClub', {
            id: movieID || id,
            senderName,
            title,
            club_id: getParam('club_id', '0'),
            clubName: getParam('clubName')
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
}
