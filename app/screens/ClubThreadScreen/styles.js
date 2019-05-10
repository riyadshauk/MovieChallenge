import { StyleSheet } from 'react-native';
import { lightGreen } from '../../styles/Colors';

export default StyleSheet.create({
  // @ts-ignore
  backgroundColor: idx => {
    const colors = ['#e6f2ff', '#e6fff2'];
    return { backgroundColor: colors[idx % colors.length] };
  },
  commentDate: {
    fontSize: 10
  },
  commentTextContainer: {
    marginBottom: 10,
    marginLeft: 5,
    marginTop: 5,
    fontSize: 16
  },
  commentText: {
    color: '#3366cc'
  },
  commentUserName: {
    color: lightGreen
  },
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  movieDetails: {
    backgroundColor: '#80bdff',
    alignSelf: 'center',
    color: 'blue',
    padding: 10,
    margin: 5,
    borderRadius: 100
  },
  movieTitle: {
    alignItems: 'center',
    padding: 10
  }
});
