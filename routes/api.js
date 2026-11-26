'use strict';

const https = require('https');
const crypto = require('crypto');

// In-memory store: stock symbol -> Set of anonymized (hashed) IPs that liked it
const stockLikes = {};

function anonymizeIp(ip) {
  return crypto.createHash('sha256').update(ip || '').digest('hex');
}

function getQuote(symbol) {
  return new Promise(function (resolve, reject) {
    const url = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/' + symbol + '/quote';
    https.get(url, function (res) {
      let data = '';
      res.on('data', function (chunk) { data += chunk; });
      res.on('end', function () {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const stocks = req.query.stock;
      const like = req.query.like === 'true' || req.query.like === true;
      const ipHash = anonymizeIp(req.ip);

      if (!stocks) {
        return res.json({ stockData: null });
      }

      const symbols = Array.isArray(stocks) ? stocks : [stocks];
      const results = [];

      for (const symbol of symbols.slice(0, 2)) {
        const sym = String(symbol).toUpperCase();
        let quote = null;
        try {
          quote = await getQuote(sym);
        } catch (e) {
          quote = null;
        }
        const price = quote && typeof quote.latestPrice === 'number' ? quote.latestPrice : null;
        const stock = quote && quote.symbol ? String(quote.symbol).toUpperCase() : sym;
        if (!stockLikes[stock]) stockLikes[stock] = new Set();
        if (like) stockLikes[stock].add(ipHash);
        results.push({ stock: stock, price: price, likes: stockLikes[stock].size });
      }

      if (results.length === 1) {
        return res.json({ stockData: results[0] });
      }

      const a = results[0];
      const b = results[1];
      return res.json({
        stockData: [
          { stock: a.stock, price: a.price, rel_likes: a.likes - b.likes },
          { stock: b.stock, price: b.price, rel_likes: b.likes - a.likes }
        ]
      });
    });

};
