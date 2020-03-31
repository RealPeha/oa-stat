import React, { useState } from 'react'
import Highcharts from 'highcharts'
import HighchartsMap from 'highcharts/modules/map'
import HighchartsReact from 'highcharts-react-official'
import { DateRangePicker } from 'react-date-range'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

import useCallApi from './utils/useCallApi'

import Loader from './components/loader'

import './styles.css'

HighchartsMap(Highcharts)

const MainPage = () => {
    const [date, setDate] = useState([
        new Date().toLocaleDateString('ru'),
        new Date().toLocaleDateString('ru'),
    ])
    const [data, statLoading] = useCallApi(`/stat?startDate=${date[0]}&endDate=${date[1]}`)

    let formattedData = []

    if (data) {
        for (const d of data) {
            formattedData = [...formattedData, ...d.data.map(({ time, players }) => {
                return [
                    time,
                    players,
                ]
            })]
        }
    }

    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: null,
            key: 'selection',
        }
    ]);

    const handleSelectDate = ({ selection }) => {
        setState([selection])

        setDate([
            new Date(selection.startDate).toLocaleDateString('ru'),
            new Date(selection.endDate).toLocaleDateString('ru'),
        ])
    }

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
            <DateRangePicker
                ranges={state}
                onChange={handleSelectDate}
            />
        </Loader>
    )
}

export default MainPage
