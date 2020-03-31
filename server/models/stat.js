const mongoose = require('mongoose')

const { Schema, model } = mongoose

const scheme = new Schema({
	date: Date,
	data: [Object]
}, {
	versionKey: false,
})

module.exports = model('Stat', scheme, 'stats')
