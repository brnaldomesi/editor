import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import socketIOClient from 'socket.io-client'

import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs'
import { CloseIcon } from '../assets/Icons'

import GET_FILE from '../queries/getFile'

const Main = ({ selectedFile }) => {
	const [tabs, setTabs] = React.useState([])
	const [tabIndex, setTabIndex] = React.useState(0)

	const { loading: queryLoading, data: queryData } = useQuery(GET_FILE, {
		variables: { path: selectedFile.path },
	})
	React.useEffect(() => {
		if (queryData && Object.keys(queryData).length !== 0) {
			if (!tabs.some(tab => tab.name === queryData.getFile.name)) {
				addTab(queryData.getFile)
			} else {
				setTabIndex(
					tabs.findIndex(tab => tab.name === queryData.getFile.name)
				)
			}
		}
	}, [queryData, selectedFile])

	React.useEffect(() => {
		const socket = socketIOClient(
			'ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000'
		)

		socket.on('OpenedFiles', async (from, message) => {
			const query = `
				query getFile($path: String!) {
					getFile(path: $path) {
						size
						name
						createdAt
						content
					}
				}
			`
			const variables = {
				path: message,
			}
			const url = process.env.REACT_APP_GRAPHQL_URI
			const opts = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ query, variables }),
			}
			const fetchData = async (url, opts) => {
				const response = await fetch(url, opts)
				const data = await response.json()
				return await data
			}
			await fetchData(url, opts).then(data => {
				const { getFile } = data.data
				if (!tabs.some(tab => tab.name === getFile.name)) {
					addTab(getFile)
				} else {
					setTabIndex(
						tabs.findIndex(tab => tab.name === getFile.name)
					)
				}
			})
		})
	}, [])

	// Tabs functionality
	const removeTab = index =>
		setTabs([...tabs.filter((_, tabIndex) => tabIndex !== index)])

	const addTab = data => {
		setTabs(tabs => [
			...tabs,
			{
				name: data.name,
				content: JSON.parse(data.content),
			},
		])
		setTabIndex(tabs.length)
	}

	const handleTabsChange = index => {
		setTabIndex(index)
	}
	if (tabs.length === 0) {
		return <main id="main">Select a file from the explorer.</main>
	}
	return (
		<main id="main">
			<Tabs index={tabIndex} onChange={handleTabsChange}>
				<TabList>
					{tabs.map((tab, index) => (
						<Tab key={index}>
							<span title={tab.name}>{`${
								tab.name.length > 12
									? `${tab.name.slice(0, 10)}...`
									: tab.name
							}`}</span>
							<span onClick={() => removeTab(index)}>
								{CloseIcon}
							</span>
						</Tab>
					))}
				</TabList>

				<TabPanels>
					{tabs.map((tab, index) => (
						<TabPanel key={index}>
							<pre>{JSON.stringify(tab.content, null, 4)}</pre>
						</TabPanel>
					))}
				</TabPanels>
			</Tabs>
		</main>
	)
}

export default Main
