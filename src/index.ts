require('dotenv').config();

import fastify from 'fastify';
import helmet from 'fastify-helmet';
import cors from 'fastify-cors';

const app = fastify({ logger: true });

app.register(helmet);
app.register(cors);
app.register(require('fastify-rate-limit'), {
  max: +process.env.MAX_CONNECTION_PER_MINUTE || 1000,
  timeWindow: '1 minute'
});
app.register(require('./plugins/knex'), {
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: +process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },
  pool: {
    min: 0,
    max: 7,
    afterCreate: (conn, done) => {
      conn.query('SET NAMES utf8', (err) => {
        done(err, conn);
      });
    }
  },
  debug: false,
  acquireConnectionTimeout: 5000
});

app.setErrorHandler(function (error, request, reply) {
  var statusCode = error.statusCode >= 400 ? error.statusCode : 500
  reply
    .code(statusCode)
    .type('text/plain')
    .send(statusCode >= 500 ? `${statusCode} (Internal server error)` : error.message)
})

app.register(require('./controllers/index'));
app.register(require('./controllers/dashboard'), { 'prefix': '/donate' });

const start = async () => {
  const port = +process.env.PORT || 3000;
  try {
    const address = await app.listen(port, '0.0.0.0');
    console.log(`Server listening on ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();