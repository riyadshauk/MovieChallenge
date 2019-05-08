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

let comments;
let commentsToPost;

/**
 * @see https://stackoverflow.com/questions/39576/best-way-to-do-multi-row-insert-in-oracle#answer-93724
 */
const insertCommentsUsingSQL = async i => {
  try {
    let insertManyComments = 'INSERT ALL';
    comments
      .slice(i * commentsToPost, (i + 1) * commentsToPost)
      .forEach(comment => {
        insertManyComments += ` INTO "club_comments" ("club_id", "user_id", "parent_comment_id", "comment", "movie_id", "time")
        VALUES (${comment.club_id}, ${comment.user_id}, ${
          comment.parent_comment_id
        }, '${comment.comment}', ${comment.movie_id}, '${
          comment.time
        }')`.replace(/\s+/g, ' ');
      });
    insertManyComments += ' SELECT 1 FROM DUAL';
    const response = await sql(insertManyComments);
    // eslint-disable-next-line no-console
    console.log(
      'response after inserting to club_comments using SQL:',
      response
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      'Error inserting into club_comments using SQL',
      err.stack ? err.stack : err
    );
  }
};

const insertCommentsUsingInsert = async i => {
  try {
    const response = await insert(
      'club_comments',
      comments.slice(i * commentsToPost, (i + 1) * commentsToPost)
    );
    // eslint-disable-next-line no-console
    console.log(
      'response after inserting to club_comments using "insert" method:',
      response
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(
      'Error inserting into club_comments using "insert" method',
      err.stack ? err.stack : err
    );
  }
  // }, 1500 * Math.random() + 1500);
};

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
    comments = []; // await generateCommentsAndReplies();
    // comments = await generateCommentsAndReplies();
    // console.log('comments.length:', comments.length);
    // console.log('comments:', comments);

    // Oracle Mobile Hub seems to have both a POST-size limit and a request-frequency limit...
    // so the trick is to send a small enough POSTs infrequently enough, to avoid both limits.
    commentsToPost = 15;
    comments.sort(() => (Math.random() < 0.5 ? 1 : -1));
    [
      ...new Array(Math.round(Math.floor(comments.length + 1) / commentsToPost))
    ].forEach((val, i) => {
      setTimeout(
        insertCommentsUsingSQL,
        (i + 1) * 1500 * Math.random() + 1500,
        i
      );
      // setTimeout(insertCommentsUsingInsert, (i + 1) * 1500 * Math.random() + 1500, i);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(new Error('There was an error!').stack);
    // eslint-disable-next-line no-console
    console.error(err.stack ? err.stack : err);
  }
};

configure();
