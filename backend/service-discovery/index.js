const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

app.use(cors());
app.use(express.json());

const routes = require('./controllers/gateway-controller');
app.use("/", routes);

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});