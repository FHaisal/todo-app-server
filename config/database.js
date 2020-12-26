const mongoose = require('mongoose');
const config = require('config');
const mongoURI = config.get('mongoURI');

const database = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected...');
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
};

module.exports = database;