

// const mongoose = require('mongoose');
// mongoose.connect('mongodb+srv://test_user:root@cluster0.5y1hbxf.mongodb.net/test-db?retryWrites=true&w=majority').then(() => { console.log('Database connected!') }).catch((err) => { console.log('error in connecting to database',err) });



const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://test_user:root@cluster0.5y1hbxf.mongodb.net/test-db?retryWrites=true&w=majority').then(() => { console.log('Database connected!') }).catch((err) => { console.log('error in connecting to database',err) });
