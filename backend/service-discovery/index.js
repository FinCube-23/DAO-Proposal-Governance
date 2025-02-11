const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config({ path: ".env.local" });

app.use(cors());
app.use(express.json());

// const routes = require("./controllers/gateway-controller");
// app.use("/", routes);

const SERVICE_URLS = {
  "audit-trail-service": process.env.AUDIT_TRIAL_SERVICE_URL,
  "dao-service": process.env.DAO_SERVICE_URL,
  "user-management-service": process.env.USER_MANAGEMENT_SERVICE_URL,
  "web3-proxy-service": process.env.WEB3_PROXY_SERVICE_URL,
};

// Set up proxy middleware for each service
Object.keys(SERVICE_URLS).forEach((serviceName) => {
  const target = SERVICE_URLS[serviceName];

  if (target) {
    console.log(`Proxying /${serviceName} to ${target}`);
    app.use(
      `/${serviceName}`,
      createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { [`^/${serviceName}`]: "" },
        onError: (err, req, res) => {
          console.error(`Proxy error for ${serviceName}:`, err);
          res.status(500).json({ error: "Proxy error", details: err.message });
        },
      })
    );
  } else {
    console.warn(`Skipping proxy setup for ${serviceName}, URL not set.`);
  }
});

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});
