import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  create: {
    padding: 10,
    backgroundColor: '#3399ff',
    margin: 3,
    position: 'absolute',
    right: 0,
    top: 0
  },
  explore: {
    left: 0,
    padding: 10,
    backgroundColor: '#3399ff',
    margin: 3,
    position: 'absolute',
    top: 0
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
  paragraph: {
    textAlign: 'center',
    color: '#002f2f',
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 18
  }
});
