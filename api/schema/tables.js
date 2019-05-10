/**
 * This file is only referenced by configure_omce_db.js
 */
/**
 * @todo when implementing DB at high-level, take a look at this screenshot of this System Design
 * Video on how to design a chatting app like Messenger or Whatsapp by Tushar Roy (20 min in):
 * @see https://www.youtube.com/embed/zKPNUMkwOJE?start=1230
 */
export default {
  user: {
    name: 'user',
    columns: [{ name: 'email', type: 'string', size: 200 }],
    requiredColumns: ['email']
  },
  club: {
    name: 'club',
    columns: [
      { name: 'member_id', type: 'decimal' },
      { name: 'clubname_id', type: 'decimal' },
      { name: 'description', type: 'string' }
    ],
    requiredColumns: ['member_id', 'clubname_id']
  },
  club_name: {
    name: 'club_name',
    columns: [{ name: 'name', type: 'string', size: 200 }],
    requiredColumns: ['name']
  },
  club_comments: {
    name: 'club_comments',
    columns: [
      { name: 'club_id', type: 'decimal' },
      { name: 'user_id', type: 'decimal' },
      { name: 'parent_comment_id', type: 'decimal' },
      { name: 'comment', type: 'string' },
      { name: 'movie_id', type: 'decimal' },
      { name: 'time', type: 'string' }
    ],
    requiredColumns: [
      'club_id',
      'user_id',
      'parent_comment_id',
      'comment',
      'movie_id',
      'time'
    ]
  },
  club_request: {
    name: 'club_request',
    columns: [
      { name: 'sender_id', type: 'decimal' },
      { name: 'recipient_id', type: 'decimal' },
      { name: 'club_id', type: 'decimal' }
    ],
    requiredColumns: ['sender_id', 'recipient_id', 'club_id']
  },
  mentions: {
    name: 'mentions',
    columns: [
      /**
       * (eg, user.id)
       */
      { name: 'mentioner_id', type: 'decimal' },
      { name: 'mentionee_id', type: 'decimal' },
      /**
       * (eg, club_comments.id)
       */
      { name: 'comment_id', type: 'decimal' }
    ]
  }
};
