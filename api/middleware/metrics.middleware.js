const {
    httpRequestsTotal,
    httpRequestDuration
} = require("../metrics/metrics");

module.exports = (req, res, next) => {
    if (req.path === "/metrics") {
        return next();
    }

    const end = httpRequestDuration.startTimer({
        method: req.method
    });

    res.on("finish", () => {
        httpRequestsTotal.inc({
            method: req.method,
            status_code: res.statusCode
        });

        end({
            status_code: res.statusCode
        });
    });

    next();
};