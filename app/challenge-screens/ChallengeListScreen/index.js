import React from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  AsyncStorage
} from 'react-native';
import {
  List,
  ListItem
} from 'react-native-elements';
import PropTypes from 'prop-types';

import styles from './styles';
import config from '../../../config';

const { headers } = config;


/**
 * @author Darshan Sapaliga
 */
export default class ChallengeListScreen extends React.Component {
  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    navigation: PropTypes.object.isRequired
  }

  static navigationOptions = {
    title: 'ChallengeList'
  };

  constructor(props) {
    super(props);

    const { navigation } = this.props;

    this.state = {
      email: navigation.getParam('email', 'no-email-address-found@example.com'),
      challengeList: []
    };
  }

  getChallengeList = async () => {
    const options = {
      method: 'get',
      headers: config.headers,
      json: true
    };

    // console.log(options);
    const response = await fetch(`${config.baseURL} /mobile/custom/Ash_SKy/ChallengeList`, options);
    const responseJson = await response.json();

    // challengeList - find the challenges for the logged in user
    if (responseJson == null || responseJson === undefined) {
      await AsyncStorage.setItem('largestChallengeId', '1');
      console.log('No data returned');
    } else {
      console.log('data returned', responseJson);
      await this.getUserChallenges(responseJson);
    }
  }

  getUserChallenges = challengeJson => {
    const { email, challengeList } = this.state;

    // loop through all the challenges to find the list for currentUser
    challengeJson.items.forEach(async item => {
      if (largest < item.challengeid) {
        largest = item.challengeid;
      }

      if ((email === item.challengerid) && (item.status === 0)) {
        // call to get the challenger user (I think so)
        const getuserurl = `${config.baseURL} /mobile/custom/Ash_SKy/GetUser/ ${item.userid}`;
        const options = {
          method: 'GET',
          json: true,
          headers
        };
        const response = await fetch(getuserurl, options);
        const responseJson = response.json();

        item.email = GetUSerJSON.items[0].email;
        console.log(item);

        // update challengelist for currentUser
        challengeList.push(item);
      }
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.getStartedText}>Movie Matching Challenge</Text>
          </View>

          <View style={styles.listContainer}>
            <Text style={styles.getStartedText}>You have been challenged by </Text>
            {/* <List containerStyle={{ marginBottom: 20 }}>
              {
                list.map((l) => (
                  <ListItem
                    roundAvatar
                    key='test'
                    title='test'
                  />
                ))
              }
            </List> */}
            <Button
              onPress={this.getChallengeList}
              title="Learn More"
              color="#841584"
              accessibilityLabel="Learn more about this purple button"
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}