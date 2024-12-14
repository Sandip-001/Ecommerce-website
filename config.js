const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/Ecommerce'; // Replace with your MongoDB URI

async function connectToDatabase() {
    try {
        await mongoose.connect(url);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = connectToDatabase;