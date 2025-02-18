import getDb from "./db";

export const fetchInitialData = async (q, count = 100, skip = 0, verified) => {
  const db = await getDb();

  if (count > 500) count = 500;

  const criteria = {};
  if (q !== undefined)
    criteria.or = [{ "handle ilike": `%${q}%` }, { "ens ilike": `%${q}%` }];

  const [allFrens, frensCount] = await db.withConnection(async (tx) => {
    const allFrensReq = await tx.fren_ranks.find(criteria, {
      order: [{ field: "followers", direction: "desc", nulls: "last" }],
      offset: skip,
      limit: count,
    });
    const allFrensCount = parseInt(await tx.fren_ranks.count(criteria));
    return [allFrensReq, allFrensCount];
  });

  const frens = allFrens.map((x) => ({
    id: x.id,
    name: x.name,
    ens: x.ens,
    handle: x.handle,
    followers: x.followers,
    verified: x.verified,
    tweeted: x.tweeted,
    created: x.created.toISOString(),
    ensAvatar: x.ens_avatar,
    twitterPicture: x.twitter_pfp,
    ranking: parseInt(x.ranking),
  }));

  return { frens, count: frensCount };
};

export const fetchInitialMetadata = async () => {
  const db = await getDb();
  const [countAll, top1000] = await db.withConnection(async (tx) => {
    const countAllReq = parseInt(await tx.fren_ranks.count());
    const top1000Req = await tx.fren_ranks.find(
      {},
      {
        order: [{ field: "followers", direction: "desc", nulls: "last" }],
        offset: 0,
        limit: 1000,
      }
    );
    return [countAllReq, top1000Req];
  });
  const top500 = top1000[999].followers;
  const top100 = top1000[99].followers;
  const top10 = top1000[9].followers;
  const response = {
    top10,
    top100,
    top500,
    countAll,
  };

  return response;
};
