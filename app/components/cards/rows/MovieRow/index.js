import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';

import Image from 'react-native-scalable-image';

import language from '../../../../assets/language/iso.json';
import genre from '../../../../assets/genre/ids.json';

import { TouchableOpacity } from '../../../common/TouchableOpacity';

import { width } from '../../../../utils/Metrics';
import { notFound } from '../../../../utils/StaticImages';

import styles from './styles';

const getImageApi = image =>
  image ? { uri: `https://image.tmdb.org/t/p/w500/${image}` } : notFound;

const convertToDate = date => new Date(date).getFullYear() || '';

const convertToUpperCaseFirstLetter = value => {
  const str = language[value] || '';
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
};

const convertGenre = (arr, type, isSearch) => {
  if (arr === undefined) {
    return '';
  }
  if (type === 'normal' || isSearch) {
    if (arr.length > 1) return `${genre[arr[0]].name}, ${genre[arr[1]].name}`;
    return arr.length !== 0 ? `${genre[arr[0]].name}` : '';
  }
  return arr.length !== 0 && type !== genre[arr[0]].name
    ? `${type}, ${genre[arr[0]].name}`
    : type;
};

const renderDivider = (releaseDate, originalLanguage) =>
  releaseDate && originalLanguage !== 'xx' ? (
    <Text style={styles.trace}>|</Text>
  ) : null;

const renderScore = rating => {
  if (rating === undefined) {
    return (
      <View style={[styles.score, styles.low]}>
        <Text style={styles.textPercent}>None</Text>
      </View>
    );
  }
  const color = rating < 5 ? 'low' : rating >= 5 && rating < 7 ? 'mid' : 'high';

  return (
    <View style={[styles.score, styles[color]]}>
      <Text style={styles.textPercent}>{rating}</Text>
    </View>
  );
};

export default class MovieRow extends PureComponent {
  render() {
    const {
      numColumns,
      item,
      type,
      isSearch,
      navigate,
      userRatings
    } = this.props;

    const userRating =
      userRatings !== undefined ? userRatings[item.id] : undefined;

    if (numColumns === 1) {
      return (
        <View style={styles.containerItem}>
          <Image
            source={getImageApi(item.poster_path)}
            style={styles.photo}
            width={width * 0.3}
          />
          <View style={styles.item}>
            <View>
              <Text numberOfLines={2} style={styles.textTitle}>
                {item.title}
              </Text>
              <View style={[styles.textRow, styles.containerSubTitle]}>
                <Text style={styles.textSmall}>
                  {convertToDate(item.release_date)}
                </Text>
                {renderDivider(item.release_date, item.original_language)}
                <Text numberOfLines={1} style={styles.textSmall}>
                  {convertToUpperCaseFirstLetter(item.original_language)}
                </Text>
              </View>
              <Text numberOfLines={1} style={styles.textSmall}>
                {convertGenre(item.genre_ids, type, isSearch)}
              </Text>
            </View>
            <View style={[styles.textRow, styles.containerReview]}>
              <Text>your rating ➝ </Text>
              {renderScore(userRating)}
            </View>
            <View style={[styles.textRow, styles.containerReview]}>
              <Text>rating ➝ </Text>
              {renderScore(item.vote_average)}
            </View>
          </View>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={styles.containerTwoItem}
        onPress={() => navigate('MovieDetails', { id: item.id })}
      >
        <View>
          <Image
            source={getImageApi(item.poster_path)}
            style={styles.photo}
            width={width * 0.33}
          />
        </View>
        <Text numberOfLines={2} style={styles.textTwoTitle}>
          {item.title}
        </Text>
      </TouchableOpacity>
    );
  }
}
