const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const CronJob = require('cron').CronJob
require('dotenv').config()

const connect = require('./connect')
const StatModel = require('./models/stat')
const parse = require('./parse')

const grabData = async () => {
    const [data, status] = await parse(process.env.SERVER_URL)

    const dates = {}

    data.forEach(([time, players]) => {
        const formatDate = new Date(time).toLocaleDateString('ru')
        const payload = {
            time,
            players,
        }

        if (!status) {
            payload.offline = true
        }

        if (dates[formatDate]) {
            dates[formatDate].push(payload);
        } else {
            dates[formatDate] = [payload];
        }
    });

    for (const [date, data] of Object.entries(dates)) {
        await StatModel.findOneAndUpdate({ date }, { data }, { upsert: true })
            .catch(err => console.error(`[${date}]: error while grabbed data: ${err}`))

        console.log(`(${new Date().toLocaleTimeString()}) [${date}]: grabbed data successful`)
    }
}

const job = new CronJob('0 */5 * * * *', grabData)

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/stat', async (req, res) => {
    if (req.query.date) {
        const stats = await StatModel.findOne({ date: req.query.date })
        res.json(stats)

        return
    }

    const stats = await StatModel.find({})
    res.json(stats)
})

app.listen(3001, () => {
    console.log("Listening at :3001...")
})

const run = async () => {
    await connect()

    await grabData()

    job.start()
}

run()
