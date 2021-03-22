require('dotenv-safe').config();

const app = require('express')(),
      router = require('routes/router'),
      { onError } = require('config/error');

app.use(router())

app.listen(process.env.PORT, () => { console.log('Running on port: ', process.env.PORT) });
app.on('error', onError);