require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(mongoose.connection.readyState);

const schema = new mongoose.Schema({name: String});
const Url = mongoose.model('Url', schema);

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl/", function(req, res) {
  const bodyUrl = req.body.url;
  console.log(bodyUrl);
  const urlConfirmation = dns.lookup(urlParser.parse(bodyUrl).hostname, (err, address, family) => {
    if (!address) {
      res.json({error: "invalid URL"});
    } else {
      const newUrl = new Url({name: bodyUrl});
      newUrl.save((err, data) => {
        if (err) {
          res.json({error: "invalid URL"});
        } else {
          res.json({original_url: bodyUrl, short_url: data._id});
        }
      });
    }
  });
});

app.get("/api/shorturl/:id", function(req, res) {
  const id = req.params.id;
  Url.findOne({_id: id}, (err, data) => {
    if (!data) {
      res.json({error: "invalid URL"});
    } else {
      res.redirect(data.name);
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
