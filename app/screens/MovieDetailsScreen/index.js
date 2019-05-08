/* eslint-disable camelcase */
import React, { Component, Fragment } from 'react';
import { AsyncStorage, Picker, ScrollView, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ReadMore from 'react-native-read-more-text';
import { RkButton } from 'react-native-ui-kitten';

import { Alert } from '../../components/common/Alert';
import { Share } from '../../components/common/Share';
import Spinner from '../../components/common/Spinner';
import NotificationCard from '../../components/cards/NotificationCard';
import PosterRow from '../../components/cards/rows/PosterRow';
import PersonModal from '../../components/modals/PersonModal';
import PersonListRow from '../../components/cards/rows/PersonListRow';
import PersonRow from '../../components/cards/rows/PersonRow';
import SectionRow from '../../components/cards/rows/SectionRow';
import MainInfoRow from '../../components/cards/rows/MainInfoRow';
import { TouchableOpacity } from '../../components/common/TouchableOpacity';

import request, { requestRecommendationAPI } from '../../services/Api';

// @ts-ignore
import language from '../../assets/language/iso.json';
import { darkBlue } from '../../styles/Colors';

import styles from './styles';

import config from '../../../config';

const { getItem } = AsyncStorage;

const uninformed = 'Uninformed';

const renderTruncatedFooter = handlePress => (
  <TouchableOpacity onPress={handlePress}>
    <Text style={styles.readMore}>Read more</Text>
  </TouchableOpacity>
);

const renderRevealedFooter = handlePress => (
  <TouchableOpacity onPress={handlePress}>
    <Text style={styles.readMore}>Read less</Text>
  </TouchableOpacity>
);

export default class MovieDetailsScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};

    return {
      title: 'Movie details',
      headerRight: (
        <TouchableOpacity
          style={styles.buttonShare}
          onPress={params.actionShare}
        >
          <Feather name="share" size={23} color={darkBlue} />
        </TouchableOpacity>
      )
    };
  };

  state = {
    isLoading: true,
    isError: false,
    isVisible: false,
    showImage: false,
    creditId: null,
    rating: 5,
    user_id: undefined,
    previouslySubmittedRating: 'None'
  };

  async componentDidMount() {
    this.props.navigation.setParams({ actionShare: this.actionShare });
    // @todo why can't this be combined with the next setState without an exception being thrown..?
    this.setState({
      user_id: Number(await getItem('user_id')),
      previouslySubmittedRating: await this.fetchPreviouslySubmittedRating()
    });
    this.setState(prevState => ({
      rating:
        prevState.previouslySubmittedRating !== 'None'
          ? prevState.previouslySubmittedRating
          : prevState.rating
    }));
    this.requestMoviesInfo();
  }

  // @ts-ignore
  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.state.isVisible !== nextState.isVisible ||
      this.state.showImage !== nextState.showImage ||
      this.state.isLoading !== nextState.isLoading ||
      this.state.isError !== nextState.isError ||
      this.state.rating !== nextState.rating ||
      this.state.previouslySubmittedRating !==
        nextState.previouslySubmittedRating
    ) {
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    if (
      this.state.updateUserRatingRequest &&
      this.state.updateUserRatingRequest.cancel instanceof Function
    ) {
      this.state.fetchChallengeListRequest.cancel();
    }
  }

  requestMoviesInfo = async () => {
    try {
      this.setState({ isLoading: true });

      const { id } = this.props.navigation.state.params;

      const data = await request(`movie/${id}`, {
        include_image_language: 'en,null',
        append_to_response: 'credits,videos,images'
      });

      this.setState({
        isLoading: false,
        isError: false,
        id,
        backdropPath: data.backdrop_path || '',
        title: data.title || '',
        voteAverage: data.vote_average || 0,
        video: data.videos.results[0] || [],
        overview: data.overview || uninformed,
        cast: this.sliceArrayLength(data.credits.cast, 15),
        crew: this.sliceArrayLength(data.credits.crew, 15),
        productionCompanies: this.sliceArrayLength(
          data.production_companies,
          10
        ),
        images: this.formatImageUrl(data.images.backdrops),
        infosDetail: this.getInfosDetail(data)
      });
    } catch (err) {
      this.setState({
        isLoading: false,
        isError: true
      });
    }
  };

  /* eslint-disable camelcase */
  getInfosDetail = ({
    runtime,
    genres,
    original_language,
    release_date,
    budget,
    revenue,
    adult
  }) => {
    return {
      Duration: this.convertMinsToHrsMins(runtime || 0),
      Genre: this.convertToGenre(this.sliceArrayLength(genres, 2) || ''),
      Language: this.convertToUpperCaseFirstLetter(
        language[original_language] || ''
      ),
      Release: this.convertToDate(release_date || ''),
      Budget: this.convertToDollar(budget || 0),
      Revenue: this.convertToDollar(revenue || 0),
      Adult: this.convertAdult(adult || '')
    };
  };
  /* eslint-enable camelcase */

  formatImageUrl = images => {
    return this.sliceArrayLength(images, 15).map(item => {
      return { url: `https://image.tmdb.org/t/p/original/${item.file_path}` };
    });
  };

  sliceArrayLength = (arr, num) => {
    return arr.length > num ? arr.slice(0, num) : arr;
  };

  convertToDollar = value => {
    return (
      `$${value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}` ||
      uninformed
    );
  };

  convertAdult = adult => (adult === false ? 'Yes' : 'No' || uninformed);

  convertMinsToHrsMins = runtime => {
    let h = Math.floor(runtime / 60);
    let m = runtime % 60;
    // @ts-ignore
    h = h < 10 ? `0${h}` : h;
    // @ts-ignore
    m = m < 10 ? `0${m}` : m;
    return h && m ? `${h}h ${m}m` : uninformed;
  };

  convertToGenre = genre => {
    return genre.length > 0
      ? genre.length > 1
        ? `${genre[0].name}, ${genre[1].name}`
        : genre[0].name
      : uninformed;
  };

  convertToUpperCaseFirstLetter = originalLanguage => {
    return originalLanguage.charAt(0).toUpperCase() + originalLanguage.slice(1);
  };

  convertToDate = releaseDate => {
    const date = new Date(releaseDate);
    return (
      `${date.getDate() + 1}/${date.getMonth() + 1}/${date.getFullYear()}` ||
      uninformed
    );
  };

  actionPerson = (creditId = '') => {
    this.setState(({ isVisible }) => {
      return { creditId, isVisible: !isVisible };
    });
  };

  actionImage = () => {
    this.setState(({ showImage }) => {
      return { showImage: !showImage };
    });
  };

  actionShare = () => {
    const { isError, title, id } = this.state;

    if (isError) {
      Alert({
        title: 'Attention',
        description: 'Something wrong has happened, please try again later.'
      });
    } else {
      Share({
        message: `${title}, know everything about this movie \u{1F37F}`,
        url: `https://www.themoviedb.org/movie/${id}`,
        title: 'AmoCinema',
        dialogTitle: `${title}, know everything about this movie \u{1F37F}`
      });
    }
  };

  renderItem = (item, type, actionTeamDetail) => (
    <PersonRow item={item} type={type} actionTeamDetail={actionTeamDetail} />
  );

  renderListEmpty = () => (
    <View>
      <Text style={styles.subTitleInfo}>Uninformed</Text>
    </View>
  );

  updateUserRating = () => {
    return new Promise(async (resolve, reject) => {
      const body = {
        movie_id: this.props.navigation.state.params.id,
        user_id: this.state.user_id,
        rating: Number(this.state.rating)
      };
      const options = {
        method: 'post',
        headers: {
          ...config.headers,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      };
      try {
        const data = await requestRecommendationAPI('ratings', options);
        resolve(data);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err && err.stack ? err.stack : err);
        reject(err.stack);
      }
    });
  };

  RatingPicker = () => {
    return (
      <Fragment>
        <Text style={styles.previousRating}>
          {`Your Previously Submitted Rating: ${
            this.state.previouslySubmittedRating
          }`}
        </Text>
        <Picker
          selectedValue={this.state.rating}
          style={styles.picker}
          onValueChange={rating => this.setState({ rating })}
        >
          {[...Array(11)].map((v, i) => (
            <Picker.Item
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              label={String(i)}
              value={i}
            />
          ))}
        </Picker>
      </Fragment>
    );
  };

  fetchPreviouslySubmittedRating = async () => {
    const { getParam } = this.props.navigation;
    const ratings = (await requestRecommendationAPI(
      `ratings?user_id=${await getItem('user_id')}`,
      { method: 'get' }
    )).payload;
    // eslint-disable-next-line camelcase
    const movie_id = getParam('id');
    for (let i = 0; i < ratings.length; i += 1)
      // eslint-disable-next-line camelcase
      if (ratings[i].movie_id === movie_id) return ratings[i].user_rating;
    return -1;
  };

  render() {
    const {
      isLoading,
      isError,
      backdropPath,
      voteAverage,
      video,
      title,
      infosDetail,
      overview,
      cast,
      crew,
      productionCompanies,
      images,
      creditId,
      isVisible,
      showImage
    } = this.state;

    const { navigate } = this.props.navigation;

    return (
      <View style={styles.container}>
        {isLoading ? (
          <Spinner />
        ) : isError ? (
          <NotificationCard
            icon="alert-octagon"
            action={this.requestMoviesInfo}
          />
        ) : (
          <ScrollView>
            <PosterRow
              title={title}
              backdropPath={backdropPath}
              voteAverage={voteAverage}
              images={images}
              video={video}
              navigate={navigate}
              showImage={showImage}
              onPress={this.actionImage}
            />
            <View style={styles.containerMovieInfo}>
              <MainInfoRow data={infosDetail} />
              <this.RatingPicker />
              <RkButton
                rkType="xlarge"
                onPress={async () => {
                  this.setState({
                    updateUserRatingRequest: this.updateUserRating()
                  });
                  await this.state.updateUserRatingRequest;
                  this.setState(prevState => ({
                    previouslySubmittedRating: prevState.rating
                  }));
                }}
              >
                <Text>Rate This Movie</Text>
              </RkButton>
              <SectionRow title="Synopsis">
                <ReadMore
                  numberOfLines={3}
                  renderTruncatedFooter={renderTruncatedFooter}
                  renderRevealedFooter={renderRevealedFooter}
                >
                  <Text style={styles.subTitleInfo}>{overview}</Text>
                </ReadMore>
              </SectionRow>
              <SectionRow title="Main cast">
                <PersonListRow
                  data={cast}
                  type="character"
                  keyItem="creditId"
                  ListEmptyComponent={this.renderListEmpty}
                  actionTeamDetail={this.actionPerson}
                  renderItem={this.renderItem}
                />
              </SectionRow>
              <SectionRow title="Main technical team">
                <PersonListRow
                  data={crew}
                  type="job"
                  keyItem="creditId"
                  ListEmptyComponent={this.renderListEmpty}
                  actionTeamDetail={this.actionPerson}
                  renderItem={this.renderItem}
                />
              </SectionRow>
              <SectionRow title="Producer" isLast>
                <PersonListRow
                  data={productionCompanies}
                  type="production"
                  keyItem="id"
                  ListEmptyComponent={this.renderListEmpty}
                  actionTeamDetail={this.actionPerson}
                  renderItem={this.renderItem}
                />
              </SectionRow>
            </View>
          </ScrollView>
        )}
        <PersonModal
          isVisible={isVisible}
          creditId={creditId}
          actionClose={this.actionPerson}
          style={styles.bottomModal}
        />
      </View>
    );
  }
}
