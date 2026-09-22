module.exports = function handler(req, res) {
  res.setHeader('Cache-Control','no-store');
  res.status(200).json({
    ok:true,
    retired:true,
    mode:'worker-backtest-integral',
    message:'O benchmark backend antigo foi retirado. Use Backtest Integral exato no Web Worker.'
  });
}
