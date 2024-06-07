const express = require('express');
const router = express.Router();
const gateway_service = require("../services/gateway-service");

router.get("/:serviceName/*", gateway_service.get);
router.post("/:serviceName/*", gateway_service.post);
router.put("/:serviceName/*", gateway_service.put);
router.delete("/:serviceName/*", gateway_service.del);


module.exports = router;