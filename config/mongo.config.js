

const mongoose = require('mongoose');
const dotEnv = require('dotenv');
dotEnv.config();
mongoose.connect(process.env.MONGODB_LOCAL).then(() => { console.log('Database connected!') }).catch((err) => { console.log('error in connecting to database',err) });
module.exports = { mongoose };

