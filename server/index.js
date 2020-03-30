const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const CronJob = require('cron').CronJob
require('dotenv').config()

const connect = require('./connect')
const StatModel = require('./models/stat')
const parse = require('./parse')

const grabData = async () => {
    const data = await parse(process.env.SERVER_URL)

    const dates = {}

    data.forEach(([time, players]) => {
    const formatDate = new Date(time).toLocaleDateString('ru')

    if (dates[formatDate]) {
        dates[formatDate].push({
            time,
            players
        });
    } else {
        dates[formatDate] = [
            {
                time,
                players
            }
        ];
    }
    });

    for (const [date, data] of Object.entries(dates)) {
        await StatModel.findOneAndUpdate({ date }, { data }, { upsert: true })
    }
}

const job = new CronJob('0 30 * * * *', grabData)
const job1 = new CronJob('0 0 * * * *', grabData)

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

const run = async () => {
    await connect()
    
    await grabData()
    console.log('first grab successful')

    job.start()
    job1.start()
    console.log('auto grab launched')

    app.listen(3001, () => {
        console.log("Listening at :3001...")
    })
}

run()
