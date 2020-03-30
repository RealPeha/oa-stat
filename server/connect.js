const mongoose = require('mongoose')
require('dotenv').config()

let amount = 0

const connect = (url, opts = {}) => {
    return mongoose.connect(url || process.env.MONGO_URL, {
		useNewUrlParser: true,
		...opts,
	})
}

const start = async (url, opts = {}) => {
	connect(url, opts).then(() => console.log('Connected'))

	mongoose.connection.on('disconnected', () => {
		console.log('Disconnected')
		if (++amount <= 3) {
			connect(url, opts).then(() => console.log('Successful reconnection'))
		}
	})
}

module.exports = start
