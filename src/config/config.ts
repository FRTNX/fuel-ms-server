module.exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 2222,
    jwtSecret: process.env.JWT_SECRET || 'shh',
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_HOST || 'mongodb://' + (process.env.IP || 'localhost') + ':' + (process.env.MONGO_PORT || '27017') + '/screature-tech-fms',
    request: { limit: '20mb' },
};
