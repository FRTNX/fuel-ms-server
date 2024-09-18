import { request } from "http";

export { };

const Vehicle = require('../models/vehicle.model');
const FuelHistory = require('../models/fuel.history.model');

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
    }
}

const read = async (request, response) => {
    try {
        const validKeys = []
        const { key, value } = request.query;
        // note: ensure key is legal/valid

        const vehicle = await Vehicle.findOne({ [key]: value });
        console.log('found vehicle: ', vehicle)

        return response.json(vehicle);
    } catch (error) {
        console.log(error);
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

        console.log('assembled qeury: ', query)

        const vehicles = await Vehicle.find(query).limit(20);
        console.log('found vehicles: ', vehicles);

        return response.json(vehicles);
    } catch (error) {
        console.log(error);
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
    }
};

const recordSensorData = async (request, response) => {
    try {
        const { fuel, sensorId } = request.body;
        const vehicle = await Vehicle.findOne({ sensorId });
        if (vehicle) {
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
            return response.json({ result: 'SUCCESS' });
        }

        throw new Error('Vehicle not found')
    } catch (error) {
        console.log(error);
        return response.status(400).json({ result: 'NOPE' })
    }
};

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
        // todo: ensure all fuel datapoints have same shape

        for (let i = 0; i < 20; i++) {
            console.log('compiled fuel data:', Object.keys(fuelData))
            const datapoint = {};
            Object.keys(fuelData).map((vehicle) => {
                datapoint[vehicle] = fuelData[vehicle][i]
            });
            console.log('created datapoint:', datapoint)
            data.push(datapoint);
        }

        console.log('compiled vehicle fuel history:', data.reverse())
        return response.json(data);
    } catch (error) {
        console.log(error);
    }
}

const compileFuelData = async (vehicles) => {
    const fuelData = {};
    for (let i = 0; i < vehicles.length; i++) {
        const vehicle = vehicles[i];
        const fuelHistory = await FuelHistory.find({ vehicle: vehicle.license }).limit(20);
        // console.log('raw fuel history:', fuelHistory)
        fuelData[vehicle.license] = fuelHistory.map((data) => data.fuel * 100)
    }
}

const ping = async (request, response) => {
    try {
        return response.json({ message: 'pong' });
    } catch (error) {
        console.log(error);
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
    ping
};
