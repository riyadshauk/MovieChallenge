import React from 'react';
import { FlatList } from 'react-native';

const MovieListRow = ({
  data,
  type,
  isSearch,
  keyGrid,
  numColumns,
  refreshing,
  onRefresh,
  ListFooterComponent,
  ListEmptyComponent,
  navigate,
  renderItem,
  userRatings
}) => (
  <FlatList
    data={data}
    key={keyGrid}
    numColumns={numColumns}
    removeClippedSubviews
    keyExtractor={item => item.id.toString()}
    refreshing={refreshing}
    onRefresh={onRefresh}
    ListFooterComponent={ListFooterComponent}
    ListEmptyComponent={ListEmptyComponent}
    renderItem={({ item }) =>
      renderItem(item, type, isSearch, numColumns, navigate)
    }
    extraData={userRatings} // @see https://stackoverflow.com/questions/43397803/how-to-re-render-flatlist#answer-44599204
  />
);

export default MovieListRow;
