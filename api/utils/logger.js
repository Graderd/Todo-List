function logError(event, error, context = {}) {
    console.error(JSON.stringify({
        ...context,
        timestamp: new Date().toISOString(),
        level: "error",
        service: "todo-api",
        event,
        code: error.code || null,
        message: error.message,
    }));
}

module.exports = {
    logError
};