const base = require('../data/lotofacil-base.json');
const { buildLiveBase } = require('../lib/lotofacil-live');

module.exports = async function handler(req, res) {
  const u=new URL(req.url,'https://lf.local'),force=u.searchParams.has('refresh');
  const payload=await buildLiveBase(base,{force});
  res.setHeader('Cache-Control',force?'no-store':'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
  res.status(200).json(payload);
}
