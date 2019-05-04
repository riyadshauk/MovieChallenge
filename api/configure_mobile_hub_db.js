/* eslint-disable no-unused-vars */
import {
  deleteMethod,
  get,
  getAll,
  insert,
  merge,
  sql,
  putTablesOnMobileHub
} from './database.service';
import tables from './schema/tables';
import users from './schema/default/users';
import clubNames from './schema/default/clubNames';
import clubs from './schema/default/clubs';
import clubRequests from './schema/default/clubRequests';
import { generateCommentsAndReplies } from './schema/default/comments';

const configure = async () => {
  try {
    await putTablesOnMobileHub(tables);

    // eslint-disable-next-line no-console
    console.log('Adding users...');
    insert('user', users);

    // eslint-disable-next-line no-console
    console.log('Adding club names...');
    insert('club_name', clubNames);

    // eslint-disable-next-line no-console
    console.log('Adding clubs...');
    insert('club', clubs);

    // eslint-disable-next-line no-console
    console.log('Adding club requests...');
    insert('club_request', clubRequests);

    // eslint-disable-next-line no-console
    console.log('Adding comments...');
    /**
     * @todo fix bug here when not successfully inserting comments to Mobile Hub
     */
    const comments = await generateCommentsAndReplies();
    // console.log('comments.length:', comments.length);
    // console.log('comments:', comments);

    // Oracle Mobile Hub seems to have both a POST-size limit and a request-frequency limit...
    // so the trick is to send a small enough POSTs infrequently enough, to avoid both limits.
    const commentsToPost = 20;
    comments.sort(() => (Math.random() < 0.5 ? 1 : -1));
    [
      ...new Array(Math.round(Math.floor(comments.length + 1) / commentsToPost))
    ].forEach((val, i) => {
      setTimeout(async () => {
        try {
          const response = await insert(
            'club_comments',
            comments.slice(i * commentsToPost, (i + 1) * commentsToPost)
          );
          // console.log('response after inserting to club_comments:', response);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(
            'Error inserting into club_comments',
            err.stack ? err.stack : err
          );
        }
        // }, 1500 * Math.random() + 1500);
      }, (i + 1) * 1500 * Math.random() + 1500);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(new Error('There was an error!').stack);
    // eslint-disable-next-line no-console
    console.error(err.stack ? err.stack : err);
  }
};

configure();
