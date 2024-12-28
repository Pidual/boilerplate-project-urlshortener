require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

const urls = [];
let idCounter = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Endpoint to shorten URL
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url;
  const urlRegex = /^(http|https):\/\/[^ "]+$/;

  if (!urlRegex.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  const hostname = new URL(url).hostname;

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const shortUrl = idCounter++;
    urls.push({ original_url: url, short_url: shortUrl });
    res.json({ original_url: url, short_url: shortUrl });
  });
});

// Endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);
  const urlObj = urls.find(u => u.short_url === shortUrl);

  if (urlObj) {
    res.redirect(urlObj.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
