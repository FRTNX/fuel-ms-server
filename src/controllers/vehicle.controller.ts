import { request } from "http";

export { };

const Vehicle = require('../models/vehicle.model');
const ConsumptionRecord = require('../models/consumption.record.model');

const FuelHistory = require('../models/fuel.history.model');
const FuelPolicy = require('../models/fuel.policy.model');

const EmailRecipients = require('../models/email.recipient.model');

const random = require('../helpers/random');

// import got from 'got'

const RECENT_NOTIFICATIONS = [];

interface Sensor {
    _sensorId: string,
    _capacity: number,
    _fuel: number,
    _fuelPercentage: number,
    _updateValue: number,
    _threshold: number,
    _refillTarget: number,
    _directive: string
}

class Sensor {
    constructor(sensorId, capacity, fuel) {
        this._sensorId = sensorId;
        this._capacity = capacity,
            this._fuel = fuel,
            this._fuelPercentage = fuel / capacity,
            this._updateValue = 0.02,
            this._threshold = 0.6,
            this._refillTarget = 0.9,
            this._directive = 'burn'
    }

    sendReadings() {
        this._update();
        console.log('directive:', this._directive)
        const data = { fuel: this._fuel, sensorId: this._sensorId }
        fetch('http://localhost:2222/api/v0/sensor', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    _update() {
        console.log('fuel percentage:', this._fuelPercentage)
        console.log('fuel:', this._fuel)
        let changeInFuel;
        if (this._directive === 'burn') {
            changeInFuel = random(1, 3)
        } else {
            changeInFuel = this._capacity * 0.25
        }
        console.log('change in fuel:', changeInFuel)

        if (this._directive === 'refill') {
            const targetFill = this._capacity * this._refillTarget;
            console.log('refill target:', targetFill)

            if (this._fuel < targetFill) {
                console.log('adding more fuel')
                this._fuel += changeInFuel;
            } else {
                this._directive = 'burn';
                this._fuel -= changeInFuel
            }
        } else {
            if (this._fuelPercentage > this._threshold) {
                this._fuel -= changeInFuel;
            } else {
                // uses a probability pool tp determine whether tp refill or not
                const value = random(1, 100);
                if (value < 20 || this._fuelPercentage < 0.1) {
                    this._directive = 'refill';
                    this._fuel += changeInFuel;
                } else {
                    this._fuel -= changeInFuel;
                }
            }
        }
        this._fuelPercentage = this._fuel / this._capacity;
    }
};

const create = async (request, response) => {
    try {
        const { manufacturer, name, license, fuelCapacity, sensorId, location } = request.body;
        const vehicle = new Vehicle({
            manufacturer,
            name,
            license,
            fuelCapacity,
            sensorId,
            currentLocation: location
        });

        console.log('creating new vehicle: ', vehicle)
        await vehicle.save();

        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
        return response.status(400).json({ error });
    }
};

const read = async (request, response) => {
    try {
        const validKeys = []
        const { key, value } = request.query;
        // note: ensure key is legal/valid

        const vehicle = await Vehicle.findOne({ [key]: value });
        // console.log('found vehicle: ', vehicle)

        return response.json(vehicle);
    } catch (error) {
        console.log(error);
        return response.status(400).json({ error });
    }
};

const readAll = async (request, response) => {
    try {
        const { search, active, low } = request.query;
        let query = {};
        if (search) {
            // query.manufacturer = { '$regex': search, '$options': 'i' }
            query = {
                manufacturer: { '$regex': search, '$options': 'i' },
                name: { '$regex': search, '$options': 'i' },
                license: { '$regex': search, '$options': 'i' },
                destination: { '$regex': search, '$options': 'i' },
                sensorId: { '$regex': search, '$options': 'i' },
                driver: { '$regex': search, '$options': 'i' },
            }
        }

        if (active) {
            query['status'] = 'ACTIVE';
        }

        if (low) {
            query['fuelCapacity'] = { '$lt': 0.5 }
        }

        // console.log('assembled qeury: ', query)

        const vehicles = await Vehicle.find(query).limit(20);
        // console.log('found vehicles: ', vehicles);

        return response.json(vehicles);
    } catch (error) {
        console.log(error);
        return response.status(400).json({ error });
    }
};

const update = async (request, response) => {
    try {
        const { vehicleId, updateValues } = request.body;
        const vehicle = await Vehicle.findById(vehicleId);
        console.log('updating vehicl: ', vehicle);

        // todo: key validation
        Object.keys(updateValues).map((key) => vehicle[key] = updateValues[key]);
        await vehicle.save();

        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
        return response.status(400).json({ error });
    }
};

const remove = async (request, response) => {
    try {
        const validKeys = []
        const { key, value } = request.query;
        // note: ensure key is legal/valid

        const vehicle = await Vehicle.findOneAndDelete({ [key]: value });
        console.log('deleted vehicle: ', vehicle)

        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
        return response.status(400).json({ error });
    }
};

const notifyAdmins = async (vehicle) => {
    try {
        const { license } = vehicle;
        console.log('recent notifications: ', RECENT_NOTIFICATIONS)
        if (!RECENT_NOTIFICATIONS.includes(license)) {
            RECENT_NOTIFICATIONS.push(license);
            const subscribers = await EmailRecipients.find({});
            let recipients = '';

            subscribers.map((subscriber) => recipients += `${subscriber.email}, `)
            console.log('sending to recipients: ', recipients)

            const body = {
                msg: `A vehicle's fuel reading has dropped below the company threshold. \n\nDetails:\n` +
                    `Vehicle: ${vehicle.name}\n` +
                    `License Plate: ${vehicle.license}\n` +
                    `Driver: ${vehicle.driver}\n` +
                    `Destination: ${vehicle.destination}\n` +
                    `Fuel: ${vehicle.fuel * 100}%\n`,
                sub: 'Fuel Violation',
                to: recipients,
                from: 'Screature Tech',
                signature: '\n\n2024 Screature Tech (PVT) LTD'
            };

            await fetch('https://mail-server-m24g.onrender.com/api/v0/sendmail', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
        }

        return { result: 'SUCCESS' };
    } catch (error) {
        console.log('Email Notification Error:', error);
        return { error };
    }
};

const getFuelPolicy = async () => {
    let fuelPolicy = await FuelPolicy.findOne({});
    if (!fuelPolicy) {
        fuelPolicy = new FuelPolicy({ threshold: 0.40 });
        fuelPolicy.save();
    }
    return fuelPolicy;
};

const recordSensorData = async (request, response) => {
    try {
        const { fuel, sensorId } = request.body;
        const vehicle = await Vehicle.findOne({ sensorId });
        const fuelPolicy = await getFuelPolicy();

        if (vehicle) {
            // first check if fuel level is below threshold. if so, notify the powers that be.
            const { driver, license, fuelCapacity } = vehicle;
            const fuelPercentage = Number(fuel / fuelCapacity).toFixed(2);
            const fuelHistory = new FuelHistory({
                sensorId,
                vehicle: license,
                fuel: fuelPercentage,
                driver
            });

            vehicle.fuel = fuelPercentage;

            await fuelHistory.save();
            await vehicle.save();

            if (Number(fuelPercentage) < Number(fuelPolicy.threshold)) {
                await notifyAdmins(vehicle)
            } else {
                if (RECENT_NOTIFICATIONS.includes(vehicle.license)) {
                    const index = RECENT_NOTIFICATIONS.indexOf(vehicle.license);
                    RECENT_NOTIFICATIONS.splice(index, 1);
                    console.log('updated recents: ', RECENT_NOTIFICATIONS)
                }
            }


            return response.json({ result: 'SUCCESS' });
        }

        throw new Error('Vehicle not found')
    } catch (error) {
        // console.log(error);
        return response.status(400).json({ error });
    }
};

const monitorFuelConsumption = async (request, response) => {
    try {
        // consider selecting only active vehicles.
        // whether a vehicle is active should be determined by how long ago its
        // last fuel record was or if that reading has remained the same over a
        // certain number of entries.
        const vehicles = await Vehicle.find({});
        for (let i = 0; i < vehicles.length; i++) {
            await checkFuelConsumption(vehicles[i]);
        }

        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
        return response.status(400).json({ error });
    }
};

/**
 * This function is called once every interval. 
 * It first collects data and determines how much fuel is spent in each interval
 * then uses this fluid average to measure increases or decreases in fuel consumption.
 * @param request 
 * @param response 
 * @returns 
 */
const checkFuelConsumption = async (vehicle) => {
    try {
        // console.log('checking consumption for vehicle:', vehicle)
        // now check if fuel consumption is nominal or abnormal for this vehicle
        // todo: inspect to ensure last entry
        const consumptionRecords = await ConsumptionRecord.find({ vehicle: vehicle.license }).sort('-created');
        // console.log('found records:', consumptionRecords)

        // if this is the first consumption record for this vehicle
        if (consumptionRecords.length === 0) {
            const consumptionRecord = new ConsumptionRecord({
                vehicle: vehicle.license,
                driver: vehicle.driver,
                fuel: vehicle.fuel,
                diff: 0,
                status: 'unknown'
            });

            await consumptionRecord.save();
            return { vehicle: vehicle.license, diff: 0, status: 'unknown' };
        }

        // first confirm that vehicle is currently burning fuel
        console.log('prev fuel:', consumptionRecords[0].fuel)
        console.log('current fuel:', vehicle.fuel)
        if (consumptionRecords[0].fuel < vehicle.fuel) {
            console.log('refill detected.')
            // just log fuel change
            const consumptionRecord = new ConsumptionRecord({
                vehicle: vehicle.license,
                driver: vehicle.driver,
                fuel: vehicle.fuel,
                diff: 0,
                status: 'unknown'
            });

            await consumptionRecord.save();
            return { result: 'REFILL' };
        }
        // get the difference between the current reading and the last checkup
        const diff = (consumptionRecords[0].fuel - vehicle.fuel) * 100;
        console.log('diff:', diff)
        if (diff === 0) {
            return { result: 'TOO_SOON' }
        }

        // determine the percentage of difference between current reading and standard consumption
        const rateOfChange = diff / vehicle.standardConsumptionRate * 100;
        console.log(`deviation from mean: ${rateOfChange}%`)

        let status: string;
        if (consumptionRecords.length > 100) {
            status = rateOfChange > 100 ? 'abnormal' : 'nominal'
        } else {
            console.log('not enough data to determine status:', consumptionRecords.length)
            status = 'unknown'; // not enough data form distinction
        }

        if (status === 'abnormal') {
            console.log('abnormal consumption detected. notifying admins')
            // notify admins
        }

        // consider filtering out anomalies when calculating average
        const diffs = consumptionRecords.map((record) => record.diff).filter((value) => value !== 0);
        diffs.push(diff);
        const diffSum = diffs.reduce((partSum, value) => partSum + value, 0);
        const averageConsumption = diffSum / diffs.length;
        // console.log('diffs:', diffs.length)s
        vehicle.consumptionStatus = status;
        vehicle.consumptionRate = diff + Math.random();
        vehicle.standardConsumptionRate = averageConsumption

        const consumptionRecord = new ConsumptionRecord({
            vehicle: vehicle.license,
            driver: vehicle.driver,
            fuel: vehicle.fuel,
            diff,
            status
        });

        await consumptionRecord.save()
        await vehicle.save();

        return { vehicle: vehicle.license, diff, status };
    } catch (error) {
        console.log(error);
        return { error };
    }
};

const getFuelConsumptionHistory = async (request, response) => {
    try {
        const { id } = request.query;
        const consumptionRecords = await ConsumptionRecord.find({ vehicle: id, diff: { '$ne': 0 } }).sort('-created').limit(20);
        return response.json(consumptionRecords.reverse());
    } catch (error) {
        console.log(error);
        return response.statuus(400).json({ error });
    }
}

const getFuelHistory = async (request, response) => {
    try {
        const { vehicle } = request.query;
        if (vehicle) {
            const fuelHistory = await FuelHistory.find({ vehicle }).limit(20).sort('-created');
            const fuelData = fuelHistory.map((data) => ({ fuel: data.fuel * 100 }));
            return response.json(fuelData.reverse())
        }

        const fuelData = {};
        const data = [];
        const vehicles = await Vehicle.find({});

        for (let i = 0; i < vehicles.length; i++) {
            const vehicle = vehicles[i];
            const fuelHistory = await FuelHistory.find({ vehicle: vehicle.license }).limit(20).sort('-created');
            fuelData[vehicle.license] = fuelHistory.map((data) => data.fuel * 100)
        }

        for (let i = 0; i < 20; i++) {
            const datapoint = {};
            Object.keys(fuelData).map((vehicle) => {
                datapoint[vehicle] = fuelData[vehicle][i]
            });
            data.push(datapoint);
        }

        return response.json(data.reverse());
    } catch (error) {
        console.log(error);
        return response.status(400).json({ error });
    }
};

const compileFuelData = async (vehicles) => {
    const fuelData = {};
    for (let i = 0; i < vehicles.length; i++) {
        const vehicle = vehicles[i];
        const fuelHistory = await FuelHistory.find({ vehicle: vehicle.license }).limit(20);
        // console.log('raw fuel history:', fuelHistory)
        fuelData[vehicle.license] = fuelHistory.map((data) => data.fuel * 100)
    }
};

const launchSensorSimulators = async (request, response) => {
    try {
        const vehicles = await Vehicle.find({});
        const sensorData = vehicles.map((vehicle) => ({
            sensorId: vehicle.sensorId,
            capacity: vehicle.fuelCapacity,
            fuel: vehicle.fuel
        }));

        // await fetch('http://localhost:8000/sensors', {
        //     method: 'PUT',
        //     headers: {
        //         'Accept': 'application/json',
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(sensorData)
        // });

        await fetch('https://fuel-ms-sensor.onrender.com/sensors', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sensorData)
        });
        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
        return response.status(400).json({ error });
    }
};

const ping = async (request, response) => {
    try {
        return response.json({ message: 'pong' });
    } catch (error) {
        console.log(error);
        return response.status(400).json({ error });
    }
};

module.exports = {
    create,
    read,
    readAll,
    update,
    remove,
    recordSensorData,
    getFuelHistory,
    getFuelConsumptionHistory,
    ping,
    notifyAdmins,
    launchSensorSimulators,
    monitorFuelConsumption
};
