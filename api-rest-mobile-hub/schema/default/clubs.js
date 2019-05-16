import clubNames from './clubNames';

export default clubNames.map(clubName => ({
  member_id: 0,
  clubname_id: clubName.id,
  description: `{Description of ${clubName.name}}...`
}));
