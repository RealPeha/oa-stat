import { useEffect, useState } from 'react'

export const api = 'http://localhost:3001'

const useCallApi = (url, method = 'GET') => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = () => {
        fetch(`${api}${url}`, {
            method,
        })
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch((e) => {
                setLoading(true)
            })
    }

    useEffect(() => {
        fetchData()
    }, [url])

    return [data, loading]
}

export default useCallApi
