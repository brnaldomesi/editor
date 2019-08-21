import React from 'react'
import { useQuery } from '@apollo/react-hooks'

import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs'
import { CloseIcon } from '../assets/Icons'

import GET_FILE from '../queries/getFile'

const Main = ({ selectedFile }) => {
	const [tabs, setTabs] = React.useState([])

	const {
		loading: queryLoading,
		error: queryError,
		data: queryData,
	} = useQuery(GET_FILE, { variables: { path: selectedFile.path } })

	React.useEffect(() => {
		if (!queryLoading && queryData && Object.keys(queryData).length !== 0) {
			console.log('queryData out', queryData, tabs)
			if (!tabs.some(tab => tab.name === queryData.name)) {
				setTabs([
					...tabs,
					{
						name: queryData.getFile.name,
						content: queryData.getFile.content,
					},
				])
			}
		}
	}, [queryData, queryLoading, selectedFile])
	// Tabs functionality
	const removeTab = index =>
		setTabs([...tabs.filter((_, tabIndex) => tabIndex !== index)])
	// const addTab = () => setTabs([...tabs, { name: 'Five', content: 'Tab5' }])

	if (tabs.length === 0) {
		return <main id="main">Select a file from the explorer.</main>
	}
	return (
		<main id="main">
			<Tabs>
				<TabList>
					{tabs.map((tab, index) => (
						<Tab key={index}>
							<span>{tab.name}</span>
							<span onClick={() => removeTab(index)}>
								{CloseIcon}
							</span>
						</Tab>
					))}
					{/* <Tab onClick={() => addTab()}>{AddIcon}</Tab> */}
				</TabList>

				<TabPanels>
					{tabs.map((tab, index) => (
						<TabPanel key={index}>{tab.content}</TabPanel>
					))}
				</TabPanels>
			</Tabs>
		</main>
	)
}

export default Main
