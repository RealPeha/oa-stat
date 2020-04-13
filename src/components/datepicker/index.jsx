import React, { useState, useEffect, useRef } from 'react'
import { DateRangePicker } from 'react-date-range'

const Datepicker = ({ ranges, onSelect }) => {
    const datepickerRef = useRef()
    const [isOpenDatepicker, setIsOpenDatepicker] = useState(false)

    const handleToggleDatepicker = () => {
        setIsOpenDatepicker(!isOpenDatepicker)
    }

    const onClickOutside = (event) => {
        if (!datepickerRef.current.contains(event.target) && event.target.className !== 'datepicker-button') {
            setIsOpenDatepicker(false)
        }
    }

    useEffect(() => {
        window.addEventListener('mousedown', onClickOutside)

        return () => window.removeEventListener('mousedown', onClickOutside)
    })

    const [range = {}] = ranges;
    const startDate = range.startDate ? new Date(range.startDate).toDateString() : ''
    const endDate = range.endDate ? new Date(range.endDate).toDateString() : ''

    return (
        <div>
            <div className="datepicker-button" onClick={handleToggleDatepicker}>
                {`${startDate}${endDate && startDate !== endDate ? ` - ${endDate}` : ''}`}
            </div>
            <div ref={datepickerRef}>
                {
                    isOpenDatepicker && <DateRangePicker
                        ranges={ranges}
                        onChange={onSelect}
                        className="datepicker"
                    />
                }
            </div>
        </div>
    );
}

export default Datepicker
