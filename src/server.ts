export { };

const { config } = require('./config/config');
const mongoose = require('mongoose');

const app = require('./express');

mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log('mongo uri:', config.mongoUri)

mongoose.connection.on('error', () => {
    throw new Error(`Unable to connect to database: ${config.mongoUri}`)
});

app.listen(config.port, (error: any) => {
    if (error) {
        console.log(error);
    } else {
        console.log(`Server running on http://localhost:${config.port}/`);
    }
});
