import { result } from "lodash";

export { };

const FuelPolicy = require('../models/fuel.policy.model');
const EmailRecipient = require('../models/email.recipient.model');

const createFuelPolicy = async (request, response) => {
    try {
        const { threshold } = request.body;
        const policyExists = await FuelPolicy.exists({});
        if (policyExists) {
            return response.status(400).json({ result: 'Policy already exists.' })
        }

        const fuelPolicy = new FuelPolicy({
            threshold: threshold || 40
        });

        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
    }
};

const getFuelPolicy = async (request, response) => {
    try {
        const fuelPolicy = await FuelPolicy.findOne({});
        console.log('found fuel policy:', fuelPolicy)
        return response.json(fuelPolicy);
    } catch (error) {
        console.log(error);
    }
};


const updateFuelPolicy = async (request, response) => {
    try {
        const { threshold } = request.body;
        const fuelPolicy = await FuelPolicy.findOne({});
        console.log('got fuel policy:', fuelPolicy)
        fuelPolicy.threshold = threshold;
        fuelPolicy.save();
        return response.json({ result: 'SUCCESS' })
    } catch (error) {
        console.log(error)
    }
};

const createEmailRecipient = async (request, response) => {
    try {
        const { name, email } = request.body;
        const recipient = new EmailRecipient({
            name,
            email
        });

        recipient.save();

        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
    }
};

// const getEmailRecipient = async (request, response) => {
//     try {
//         const {id }

//     } catch (error) {
//         console.log(error);
//     }
// };

const getEmailRecipients = async (request, response) => {
    try {
        const recipients = await EmailRecipient.find({});
        return response.json(recipients);
    } catch (error) {
        console.log(error);
    }
};

const updateEmailRecipient = async (request, response) => {
    try {
        const { id, email } = request.body;
        const recipient = await EmailRecipient.findById(id);
        console.log('found recipient:', recipient)
        recipient.email = email;
        await recipient.save();
        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
    }
};

const removeEmailRecipient = async (request, response) => {
    try {
        const { id } = request.query;
        const recipient = await EmailRecipient.findOneAndDelete({ _id: id });
        console.log('deleted recipient: ', recipient)

        return response.json({ result: 'SUCCESS' });
    } catch (error) {
        console.log(error);
    }
};

const dispatchEmails = async () => {
    try {
        const body = {
            msg: 'A vehicles fuel readings has dropped below the comoany threshold. Details:',
            sub: 'Fuel Violation',
            from: 'Screature Tech',
            signature: '\n\nZugzwang Mail Service'
        };

        await fetch('https://mail-server-m24g.onrender.com/api/v0/sendmail', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

    } catch (error) {
        console.log('Email Notification Error:', error);
    }
};

module.exports = {
    createFuelPolicy,
    getFuelPolicy,
    updateFuelPolicy,
    createEmailRecipient,
    // getEmailRecipient,
    getEmailRecipients,
    updateEmailRecipient,
    removeEmailRecipient,
    dispatchEmails
};
