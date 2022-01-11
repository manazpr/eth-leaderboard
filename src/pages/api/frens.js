import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async (req, res) => {
  if (req.method === "GET") {
    console.log(req.query);
    let { q, count, skip, verified } = req.query;
    if (count > 500) count = 500;
    count |= 100;
    skip |= 0;
    const allFrens =
      await prisma.$queryRaw`SELECT * FROM (SELECT *, RANK () OVER (ORDER BY followers DESC) AS ranking FROM "Fren" WHERE LOWER(name) like '%.eth%') m1 WHERE true ${
        verified !== undefined
          ? verified === "true"
            ? Prisma.sql`AND verified`
            : Prisma.sql`AND NOT verified`
          : Prisma.empty
      } ${
        q !== undefined
          ? Prisma.sql`AND name ~~* ${`%${q}%`} OR ens ~~* ${`%${q}%`}`
          : Prisma.empty
      } ORDER BY followers DESC LIMIT ${count} OFFSET ${skip}`;

    const frens = allFrens.map((x) => ({
      id: x.id,
      name: x.name,
      ens: x.ens,
      handle: x.handle,
      followers: x.followers,
      verified: x.verified,
      tweeted: x.tweeted,
      created: x.created,
      ensAvatar: x.ens_avatar,
      twitterPicture: x.twitter_pfp,
      ranking: x.ranking,
    }));
    res.statusCode = 200;
    res.json(frens);
  }
};
