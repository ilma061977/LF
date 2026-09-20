module.exports = function handler(req, res) {
  res.status(501).json({
    error: 'Benchmark Integral 1:1 de backend não habilitado nesta edição. Use o Backtest rápido ou integral no Worker.'
  });
}
