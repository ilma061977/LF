const base = require('../data/lotofacil-base.json');

module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600');
  res.status(200).json(base);
}
