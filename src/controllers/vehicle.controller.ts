export { };

const Vehicle = require('../models/vehicle.model');

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
    ping
};
