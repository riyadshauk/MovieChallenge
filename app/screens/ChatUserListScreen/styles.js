import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // @ts-ignore
  backgroundColor: idx => {
    const colors = ['#e6f2ff', '#e6fff2'];
    return { backgroundColor: colors[idx % colors.length] };
  },
  container: {
    flex: 1
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44
  },
  list: {
    alignItems: 'center'
  }
});
