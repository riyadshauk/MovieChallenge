/* eslint-disable camelcase */
import React from 'react';
import { AsyncStorage, View, Text } from 'react-native';
import { RkTextInput, RkButton } from 'react-native-ui-kitten';

import styles from './styles';
import makeCancelable from '../../utils/makeCancelable';
import { requestDB } from '../../services/Api';

/**
 * @author Riyad Shauk
 */
export default class ClubListScreen extends React.Component {
  static navigationOptions = {
    title: 'Create a Club!'
  };

  state = {
    clubName: '',
    clubDescription: '',
    clubNameAlreadyExisted: false,
    success: true,
    createClubIfNotExists: undefined,
    submitted: false
  };

  /**
   * @see https://www.robinwieruch.de/react-warning-cant-call-setstate-on-an-unmounted-component/
   * @see https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
   */
  componentWillUnmount() {
    if (
      this.state.createClubIfNotExists &&
      this.state.createClubIfNotExists.cancel instanceof Function
    ) {
      this.state.createClubIfNotExists.cancel();
    }
  }

  createClubIfNotExists = () => {
    return makeCancelable(
      new Promise(async resolve => {
        const { getItem } = AsyncStorage;
        const { clubDescription, clubName } = this.state;
        const user_id = await getItem('user_id');
        const queryIfClubNameExists = `
          SELECT COUNT(*) AS "clubNameCount"
          FROM "club_name"
          WHERE "club_name"."name" = '${clubName}'
        `
          .replace(/\s+/g, ' ')
          .trim();
        const { clubNameCount } = await requestDB({
          method: 'sql',
          sql: queryIfClubNameExists
        });
        if (clubNameCount > 0) {
          this.setState({ clubNameAlreadyExisted: true });
          return resolve();
        }
        const queryToCreateClubName = `
          INSERT INTO "club_name" ("name")
          VALUES ('${clubName}')
        `
          .replace(/\s+/g, ' ')
          .trim();
        await requestDB({ method: 'sql', sql: queryToCreateClubName });
        const queryToGetClubNameID = `
          SELECT "id" FROM "club_name"
          WHERE "club_name"."name" = '${clubName}'
        `
          .replace(/\s+/g, ' ')
          .trim();
        const [{ id }] = (await requestDB({
          method: 'sql',
          sql: queryToGetClubNameID
        })).items;
        const queryToCreateClub = `
          INSERT INTO "club" ("member_id", "clubname_id", "description")
          VALUES (${user_id}, ${id}, '${clubDescription}')
        `
          .replace(/\s+/g, ' ')
          .trim();
        await requestDB({ method: 'sql', sql: queryToCreateClub });
        this.setState({ success: true });
        return resolve();
      })
    );
  };

  StatusMessage = () => {
    const { clubNameAlreadyExisted, clubName, submitted, success } = this.state;
    if (clubNameAlreadyExisted) {
      return (
        <Text>
          {`Sorry, '${clubName}' already exists.\
             You can either join that club (Clubs > Explore), or create a club with a different name.`}
        </Text>
      );
    }
    if (submitted && success) {
      return <Text>{`'${clubName}' successfully created!`}</Text>;
    }
    return <Text />;
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>Create a Club!!</Text>
        <RkTextInput
          placeholder="club name"
          onChangeText={clubName =>
            this.setState({ clubName, submitted: false })
          }
        />
        <RkTextInput
          placeholder="club description (optional)"
          onChangeText={clubDescription =>
            this.setState({ clubDescription, submitted: false })
          }
        />
        <RkButton
          rkType="primary xlarge"
          onPress={() =>
            this.setState({
              createClubIfNotExists: this.createClubIfNotExists(),
              submitted: true
            })
          }
        >
          <Text>Create</Text>
        </RkButton>
        <this.StatusMessage />
      </View>
    );
  }
}
