export { };

const validate = (params, requiredParams) => {
    requiredParams.map((param) => {
        if (!params[param]) {
            throw new Error(`Missing required parameter "${param}"`);
        };
    });
};

module.exports = {
    validate
};
