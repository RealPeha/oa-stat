import React, { useState, useRef, useEffect } from 'react'
import * as d3 from 'd3'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

import useCallApi from './utils/useCallApi'

import Loader from './components/loader'
import Datepicker from './components/datepicker'

import './styles.css'

const dateFormatter = d3.timeFormat("%d.%m.%y %H:%M")
const margin = { top: 50, right: 30, bottom: 50, left: 40 }
const bisectDate = d3.bisector(d => d.date).left
let offset = {
    x: 0,
    y: 0,
    k: 1,
}

const MainPage = () => {
    const d3Ref = useRef(null)

    const [date, setDate] = useState([
        new Date().toLocaleDateString('ru'),
        new Date().toLocaleDateString('ru'),
    ])
    const [data, statLoading] = useCallApi(`/stat?startDate=${date[0]}&endDate=${date[1]}`)

    let formattedData = []

    if (data) {
        for (const d of data) {
            formattedData = [
                ...formattedData,
                ...d.data.map(({ time, players }) => ({
                    date: time,
                    value: players,
                }))
            ]
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

    const drawChart = data => {
        const width = d3Ref.current.clientWidth - margin.left - margin.right
        const height = d3Ref.current.clientHeight - margin.top - margin.bottom

        const x = d3.scaleTime()
            .range([0, data.length * 2 > width ? data.length * 2 : width])
            .domain(d3.extent(data, d => d.date))

        const y = d3.scaleLinear()
            .range([height, 0])
            .domain([0, d3.max(data, d => d.value)])

        const xAxis = d3.axisBottom(x)
        const yAxis = d3.axisLeft(y)

        const zoomed = () => {
            offset = d3.event.transform

            svg.selectAll('.charts').attr('transform', d3.event.transform)
            d3.selectAll('.line').style('stroke-width', 2 / d3.event.transform.k)
            gX.call(xAxis.scale(d3.event.transform.rescaleX(x)))
            gY.call(yAxis.scale(d3.event.transform.rescaleY(y)))


            d3.selectAll('.grid')
                .call(
                    d3.axisLeft(y)
                        .scale(d3.event.transform.rescaleY(y).interpolate(d3.interpolateRound))
                        .ticks(5)
                        .tickSize(-width)
                        .tickFormat("")
                )
        }

        const zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .extent([[100, 100], [width-100, height-100]])
            .on('zoom', zoomed)

        const svg = d3.select(d3Ref.current).html('')
            .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .call(zoom)
                .append('g')
                    .attr('transform', `translate(${margin.left}, ${margin.top})`)

        svg.append('g')
            .attr('class', 'grid')
            .call(
                d3.axisLeft(y)
                    .ticks(5)
                    .tickSize(-width)
                    .tickFormat("")
            )

        svg.append('g')
            .attr('class', 'charts')
            .append('path')
                .datum(data)
                .attr('class', 'line')
                .attr('fill', 'none')
                .attr('stroke', 'rgb(255, 127, 106)')
                .attr('stroke-width', 3)
                .attr('d', d3.area()
                    .x(d => x(d.date))
                    .y0(y(0))
                    .y1(d => y(d.value))
                    .curve(d3.curveLinear)
                )

        const gX = svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)

        const gY = svg.append('g')
            .call(yAxis)

        const focus = svg.append('g')
            .attr('class', 'focus')
            .style('display', 'none')

        focus.append('circle')
            .attr('r', 5)

        focus.append('rect')
            .attr('class', 'tooltip')
            .attr('width', 100)
            .attr('height', 50)
            .attr('x', 10)
            .attr('y', -22)
            .attr('rx', 4)
            .attr('ry', 4)

        focus.append('text')
            .attr('class', 'tooltip-date')
            .attr('x', 18)
            .attr('y', -2)

        focus.append('text')
            .attr('x', 18)
            .attr('y', 18)
            .text('Игроков:')

        focus.append('text')
            .attr('class', 'tooltip-likes')
            .attr('x', 80)
            .attr('y', 18)

        function mousemove() {
            const x0 = x.invert((d3.mouse(this)[0] - offset.x) / offset.k)
            const i = bisectDate(data, x0, 1)
            const d0 = data[i - 1]
            const d1 = data[i]

            if (!d0 || !d1) {
                return
            }

            const d = x0 - d0.date > d1.date - x0 ? d1 : d0

            focus.attr('transform', `translate(${x(d.date) * offset.k + offset.x}, ${y(d.value) * offset.k + offset.y})`)
            focus.select(".tooltip-date").text(dateFormatter(d.date))
            focus.select('.tooltip-likes').text(d.value)
        }

        svg.append('rect')
            .attr('class', 'overlay')
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', () => focus.style('display', null))
            .on('mouseout', () => focus.style('display', 'none'))
            .on('mousemove', mousemove)
    }

    useEffect(() => {
        if (statLoading === false) {
            drawChart(formattedData)
        }
    }, [formattedData, statLoading])

    return (
        <Loader isLoading={statLoading}>
            <div className='wrapper'>
                <div className='title'>Ocean Of Anarchy</div>
                <div className='ip'>94.23.204.159:25618</div>
                <Datepicker
                    ranges={state}
                    onSelect={handleSelectDate}
                />
                <div className='svg-container' ref={d3Ref} />
            </div>
        </Loader>
    )
}

export default MainPage
