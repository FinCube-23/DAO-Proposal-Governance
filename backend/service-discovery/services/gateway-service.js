const axios = require("axios");
require('dotenv').config({ path: ".env.local" });
const AVAILABLE_SERVICES = ['audit-trail-service', 'dao-service', 'user-management-service', 'web3-proxy-service'];
const SERVICE_URLS = {
    'audit-trail-service': `${process.env.AUDIT_TRIAL_SERVICE_URL}`,
    'dao-service': `${process.env.DAO_SERVICE_URL}`,
    'user-management-service': `${process.env.USER_MANGEMENT_SERVICE_URL}`,
    'web3-proxy-service': `${process.env.WEB3_PROXY_SERVICE_URL}`,
};

function findServiceURL(req, res, serviceName) {
    if (!AVAILABLE_SERVICES.includes(serviceName)) {
        return res.status(404).json({ error: 'Service not found' });
    }
    const serviceUrl = SERVICE_URLS[serviceName];
    if (!serviceUrl) {
        return res.status(500).json({ error: 'Service URL not found' });
    }
    return `${serviceUrl}${req.url.replace(`/${serviceName}/`, '/')}`;
}

async function get(req, res) {
    try {
        const serviceName = req.params.serviceName;
        const requestUrl = findServiceURL(req, res, serviceName);
        const headers = {
            Authorization: req.headers.authorization // Assuming the bearer token is in the Authorization header
        };
        const response = await axios.get(requestUrl, { headers: headers });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function post(req, res) {
    try {
        const serviceName = req.params.serviceName;
        const requestUrl = findServiceURL(req, res, serviceName);
        const headers = {
            Authorization: req.headers.authorization // Assuming the bearer token is in the Authorization header
        };
        const response = await axios.post(requestUrl, req.body, { headers: headers });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function put(req, res) {
    try {
        const serviceName = req.params.serviceName;
        const requestUrl = findServiceURL(req, res, serviceName);
        const headers = {
            Authorization: req.headers.authorization // Assuming the bearer token is in the Authorization header
        };
        const response = await axios.put(requestUrl, req.body, { headers: headers });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function del(req, res) {
    try {
        const serviceName = req.params.serviceName;
        const requestUrl = findServiceURL(req, res, serviceName);
        const headers = {
            Authorization: req.headers.authorization // Assuming the bearer token is in the Authorization header
        };
        const response = await axios.delete(requestUrl, { headers: headers });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    get,
    post,
    put,
    del
};
