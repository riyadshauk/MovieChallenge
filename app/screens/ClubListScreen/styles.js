import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // @ts-ignore
  backgroundColor: idx => {
    const colors = ['#e6f2ff', '#e6fff2'];
    return { backgroundColor: colors[idx % colors.length] };
  },
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  create: {
    padding: 10,
    backgroundColor: '#3399ff',
    margin: 3,
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: 100
  },
  explore: {
    left: 0,
    padding: 10,
    backgroundColor: '#3399ff',
    margin: 3,
    position: 'absolute',
    top: 0,
    borderRadius: 100
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44
  },
  flatlist: {
    position: 'relative',
    top: 50
  },
  movieTitle: {
    alignItems: 'center',
    padding: 10
  }
});
