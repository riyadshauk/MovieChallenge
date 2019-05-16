/* eslint-disable camelcase */
import https from 'https';
import clubs from './clubs';
import { numUsers } from './users';

const generateUserMention = () => `@user${Math.round(Math.random() * 41 + 1)}`;

/**
 * This will result in a less desireable situation,
 * where a user is mentioned who isn't actually in the club
 * @param {*} dataOnMovie
 */
// eslint-disable-next-line no-unused-vars
const someMentions = dataOnMovie => [
  `${generateUserMention()} cool`,
  `${generateUserMention()} wassup`,
  `${generateUserMention()} Does this remind you of other movies we've recently seen?`,
  `${generateUserMention()} Want to go for action/adventure next time?!`
];

const someComments = dataOnMovie => [
  `That was an awesome movie –– I highly recommend ${dataOnMovie.title}!`,
  `What did you guys think about ${dataOnMovie.title}?`,
  `Want to watch ${dataOnMovie.title} again?!`,
  `What rating would you guys give ${dataOnMovie.title}?`,
  `But was ${dataOnMovie.title} as good as Avengers?!`,
  'Nice watch with the wife',
  'Great movie for kids and family',
  `${dataOnMovie.title} was awesome!!`,
  `Anybody want to watch ${dataOnMovie.title} again?!`,
  ...someMentions(dataOnMovie)
];
const someReplies = dataOnMovie => [
  'Totally!',
  'Awesomeness!',
  'So. COOL.',
  'Yeah, definitely',
  'No way, man!',
  '10/10!',
  '8/10 – pretty solid!',
  `${dataOnMovie.title} was awesome!!`
];

/**
 * Retrieves numPages of movie data (from page=1 to page=numPages)
 * @param {number} numPages
 */
const getMovieData = numPages => {
  return new Promise((resolve, reject) => {
    let pagesReceived = 0;
    const movieData = [];
    const urlWithoutPageNumber =
      'https://api.themoviedb.org/3/discover/movie?api_key=024d69b581633d457ac58359146c43f6&page=';
    [...new Array(numPages)].forEach((v, i) => {
      let data = '';
      const req = https.request(urlWithoutPageNumber + i + 1, res => {
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          movieData.push(...JSON.parse(data).results);
          pagesReceived += 1;
          if (pagesReceived === numPages) {
            resolve(movieData);
          }
        });
      });
      req.on('error', err => reject(err));
      req.end();
    });
  });
};

const generateCommentsAndRepliesForMovie = (
  club_id,
  dataOnMovie,
  maxNumCommentsAndReplies,
  mem
) => {
  const comments = someComments(dataOnMovie);
  const replies = someReplies(dataOnMovie);
  const numCommentsAndReplies = Math.round(
    Math.random() * maxNumCommentsAndReplies
  );
  const commentsAndRepliesForThisMovie = [
    ...new Array(numCommentsAndReplies)
  ].map(() => Math.random());
  const commentProb = 0.66;
  const { totalCommentsAndRepliesSoFar } = mem; // copy value
  // eslint-disable-next-line no-param-reassign
  mem.totalCommentsAndRepliesSoFar += numCommentsAndReplies;
  return commentsAndRepliesForThisMovie.map(p => ({
    id: club_id + 1 + totalCommentsAndRepliesSoFar,
    club_id,
    user_id: Math.round(Math.random() * (numUsers - 1)),
    // eg, commentProb of posts will be 'comments', (1 - commentProb) will be 'replies'
    parent_comment_id:
      p < commentProb
        ? 0
        : Math.round(Math.random()) * numCommentsAndReplies +
          totalCommentsAndRepliesSoFar +
          1,
    comment:
      p < 0.66
        ? comments[Math.round(Math.random() * comments.length - 1)]
        : replies[Math.round(Math.random() * replies.length - 1)],
    movie_id: dataOnMovie.id,
    time: new Date().toISOString()
  }));
};

// eslint-disable-next-line import/prefer-default-export
export const generateCommentsAndReplies = async () => {
  try {
    const movieData = await getMovieData(5);
    const clubDiscussesMovie = 0.15; // eg, club discusses movie with likelihood clubDiscussesMovie
    const maxNumCommentsAndReplies = 10; // per particular movie thread for each club
    const mem = { totalCommentsAndRepliesSoFar: 0 };
    const commentsAndReplies = [];
    clubs.forEach((club, idx) => {
      const movies = movieData.filter(() => Math.random() < clubDiscussesMovie);
      const commentsForMovie = movies.flatMap(movie =>
        generateCommentsAndRepliesForMovie(
          idx + 1,
          movie,
          maxNumCommentsAndReplies,
          mem
        )
      );
      commentsAndReplies.push(...commentsForMovie);
    });
    return commentsAndReplies;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
    return [];
  }
};
