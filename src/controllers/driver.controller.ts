export { };

const Driver = require('../models/driver.model');

const create = async (request, response) => {
    try {
        const { fullname, nationalId, driversLicense } = request.body;
        const driver = new Driver({
            fullname,
            nationalId,
            license: {
                number: driversLicense.number,
                class: driversLicense.class
            }
        });

        console.log('creating new driver: ', driver)
        await driver.save();

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

        const driver = await Driver.findOne({ [key]: value });
        console.log('found driver: ', driver)

        return response.json(driver);
    } catch (error) {
        console.log(error);
    }
}

const readAll = async (request, response) => {
    try {
        const { search, driverClass } = request.query;
        let query = {};
        if (search) {
            query = {
                fullname: { '$regex': search, '$options': 'i' },
                nationalId: { '$regex': search, '$options': 'i' },
                'license.number': { '$regex': search, '$options': 'i' }
            }
        }

        if (driverClass) {
            query['status'] = driverClass;
        }

        console.log('assembled qeury: ', query)

        const drivers = await Driver.find(query).select(20);
        console.log('found drivers: ', drivers);

        return response.json(drivers);
    } catch (error) {
        console.log(error);
    }
};

const update = async (request, response) => {
    try {
        const { driverId, key, value } = request.body;
        const vehicle = await Driver.findById(driverId);
        console.log('updating vehicl: ', vehicle);

        // todo: key validation
        vehicle[key] = value;
        await vehicle.save();

        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    create,
    read,
    readAll,
    update
};
