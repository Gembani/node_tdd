const cleanDb = async (db) => {
  await db.Author.truncate({ cascade: true });
  await db.Post.truncate({ cascade: true });
}
module.exports = cleanDb
