const axios = require('axios')

module.exports = async (url) => {
    const res = await axios.get(url)
    const rawHTML = res.data

    const first = 'data:'
    const second = '}]});});'
    const start = rawHTML.indexOf(first) + first.length
    const end = rawHTML.indexOf(second)

    const statusStartPattern = '[<font color="green">'
    const statusEndPattern = '</font>]</span>'
    const statusStart = rawHTML.indexOf(statusStartPattern) + statusStartPattern.length
    const statusEnd = rawHTML.indexOf(statusEndPattern)
    const statusString = rawHTML.slice(statusStart, statusEnd)

    const statData = eval(rawHTML.slice(start, end))

    return [statData, statusString.trim() === 'Онлайн']
}
