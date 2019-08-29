const fetchCall = async (url, opts) => {
	const response = await fetch(url, opts)
	const data = await response.json()
	return await data
}

export default fetchCall
