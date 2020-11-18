require('dotenv/config');
const express = require('express');
const cors = require('cors');
const rfr = require('rfr');
const helmet = require('helmet');

const routes = rfr('src/routes');

const app = express();
const PORT = process.env.PORT;
const BACKEND_SERVER_HOST = process.env.BACKEND_SERVER_HOST;

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(routes);

app.listen(PORT, () => {
  console.log(`Server running on http://${BACKEND_SERVER_HOST}:${PORT}/`);
});
