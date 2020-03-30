const Loader = ({ isLoading, children }) => {
    if (isLoading) {
        return null
    }

    return children
}

export default Loader
