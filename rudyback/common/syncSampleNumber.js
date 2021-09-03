if (process.env.NODE_ENV != 'production') {
    require('dotenv').config();
}
require('module-alias/register');
const mongoose = require('mongoose');

// connect to database if it is not connected
if (mongoose.connection.readyState == 0) {
    const config = require('@ag-config/config');
    mongoose.connect(config.db, {useMongoClient: true})
        .then(() => {
            console.log("Mongo is connected successfully...");
        })
        .catch(() => {
            process.exit();
        });
}

const SampleCabinet = require('../app/models/sampleCabinet');
const Sample = require('../app/models/sample');

module.exports = async () => {
    const { TOTAL_SAMPLE_CABINETS } = process.env;
    const samples = await Sample.find({
        dumped: { $ne: 1 },
        sampleNumber: { $exists: true, $ne: null }
    }).select("sampleNumber");

    const sampleNumbers = samples
        .map(sample => sample.sampleNumber)
        .filter(sn => sn <= TOTAL_SAMPLE_CABINETS)
        .sort((a, b) => a - b);

    await SampleCabinet.findOneAndUpdate({}, {
        available: Array.from({ length: TOTAL_SAMPLE_CABINETS }, (v, k) => k+1)
            .filter(value => !sampleNumbers.includes(value))
            .sort((a, b) => a - b),
        occupied: sampleNumbers
    }, { upsert: true });
};
