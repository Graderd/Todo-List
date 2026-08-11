const {
    Registry,
    collectDefaultMetrics,
    Counter,
    Histogram
} = require("prom-client");

const register = new Registry();

collectDefaultMetrics({
    register,
    prefix: "todo_api_"
});

const httpRequestsTotal = new Counter({
    name: "todo_api_http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "status_code"],
    registers: [register]
});

const httpRequestDuration = new Histogram({
    name: "todo_api_http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "status_code"],
    registers: [register]
});

module.exports = {
    register,
    httpRequestsTotal,
    httpRequestDuration
};