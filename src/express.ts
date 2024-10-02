export { };

const cookieParser = require('cookie-parser');
const compress = require('compression');

const cors = require('cors');
const helmet = require('helmet');

const vehicleRoutes = require('./routes/vehicle.routes');
const driverRoutes = require('./routes/driver.routes');
const fuelPolicyRoutes = require('./routes/fuel.policy.routes');
// const tripRoutes = require('./routes/trip.routes');


import { IRequest, IResponse } from './controllers/controller.types';

const express = require('express');

const app = express();

const logit = (request: IRequest, response: IResponse, next: Function) => {
    console.log('Request recieved: ', request.method, request.url);
    next();
};

// app.use(logit);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded());

app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());

app.use('/', vehicleRoutes);
app.use('/', driverRoutes);
app.use('/', fuelPolicyRoutes);
// app.use('/', tripRoutes);cosnt


app.use('*', (request: IRequest, response: IResponse, next: Function): IResponse => {
    return response.status(404).json({ error: 'Resource not found' });
});

module.exports = app;
