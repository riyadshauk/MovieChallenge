export default [...Array(42)].map((v, i) => ({
  id: i + 1,
  email: `user${i + 1}@example.com`
}));
export const numUsers = 42;
