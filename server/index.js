const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const CronJob = require('cron').CronJob
const { format, parse } = require('date-fns')
require('dotenv').config()

const connect = require('./connect')
const StatModel = require('./models/stat')
const parsePage = require('./parse')

const grabData = async () => {
    const [data, status] = await parsePage(process.env.SERVER_URL)

    const dates = {}

    data.forEach(([time, players]) => {
        const formatDate = format(new Date(time), 'dd.MM.yyyy')

        const payload = {
            time,
            players
        }

        if (!status) {
            payload.offline = true
        }

        if (dates[formatDate]) {
            dates[formatDate].push(payload);
        } else {
            dates[formatDate] = [payload];
        }
    })

    for (const [date, data] of Object.entries(dates)) {
        await StatModel.findOneAndUpdate({ date: parse(date, 'dd.MM.yyyy', new Date()) }, { data }, { upsert: true })
            .catch(err => console.error(`[${date}]: error while grabbed data: ${err}`))

        console.log(`(${format(new Date(), 'dd.MM.yyyy')}) [${date}]: grabbed data successful`)
    }
}

const job = new CronJob('0 */5 * * * *', grabData)

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/stat', async ({ query }, res) => {
    if (query.startDate) {
        const stats = await StatModel.find({
            date: {
                $gte: parse(query.startDate, 'dd.MM.yyyy', new Date()),
                $lte: parse(query.endDate || query.startDate, 'dd.MM.yyyy', new Date()),
            },
        }) || { data: [] }

        return res.json(stats)
    }

    const stats = await StatModel.find({}) || { data: [] }
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
