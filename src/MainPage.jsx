import React, { useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsMap from 'highcharts/modules/map'
import HighchartsReact from 'highcharts-react-official'

import useCallApi from './utils/useCallApi'

import Loader from './components/loader'

import './styles.css'

HighchartsMap(Highcharts)

const MainPage = () => {
    const [date, setDate] = useState(new Date().toLocaleDateString('ru'))
    const [data, statLoading] = useCallApi(`/stat?date=${date}`)

    const formattedData = data && data.data.map(({ time, players }) => {
        return [
            time,
            players,
        ]
    })

    const options = {
        mapNavigation: {
            enableMouseWheelZoom: true,
        },
        title: {
          text: 'Ocean of Anarchy'
        },
        chart: {
            type: 'spline',
            zoomType: 'x',
        },
        legend: {
            enabled: false,
        },
        xAxis: {
            type: 'datetime',
        },
        yAxis: {
            title: {
                text: '',
            },
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: 'tomato',
        }],
        plotOptions: {
            area: {
                lineColor: 'blue',
            },
            marker: {
                radius: 2,
            },
            lineWidth: 2,
        },
        series: [{
            type: 'area',
            name: 'Игроков онлайн',
            data: formattedData,
        }]
    }

    return (
        <Loader isLoading={statLoading}>
            <HighchartsReact
                highcharts={Highcharts}
                options={options}
                containerProps={{ className: 'chart-container' }}
            />
        </Loader>
    )
}

export default MainPage
