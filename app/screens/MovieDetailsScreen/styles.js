import { StyleSheet } from 'react-native';

import { white, pink, blue, darkBlue, lightGreen } from '../../styles/Colors';
import { fontSizeResponsive } from '../../utils/Metrics';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: white
  },
  buttonShare: {
    paddingRight: 15,
    paddingLeft: 20
  },
  containerMovieInfo: {
    margin: 20,
    marginTop: 35
  },
  subTitleInfo: {
    fontSize: fontSizeResponsive(2.1),
    color: blue,
    textAlign: 'justify'
  },
  readMore: {
    color: pink,
    marginTop: 5,
    textAlign: 'right'
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  buttonCompleted: {
    alignItems: 'center',
    backgroundColor: pink,
    padding: 10
  },
  title: {
    fontSize: fontSizeResponsive(2.6),
    fontWeight: 'bold',
    color: darkBlue,
    marginBottom: 7
  },
  picker: {
    width: 300
  },
  previousRating: {
    color: lightGreen
  }
});

export default styles;
