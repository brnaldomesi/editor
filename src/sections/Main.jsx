import React from 'react'
import { useQuery } from '@apollo/react-hooks'

import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs'
import { CloseIcon } from '../assets/Icons'

import GET_FILE from '../queries/getFile'

const Main = ({ selectedFile }) => {
	const [tabs, setTabs] = React.useState([])

	const { loading: queryLoading, data: queryData } = useQuery(GET_FILE, {
		variables: { path: selectedFile.path },
	})

	React.useEffect(() => {
		if (!queryLoading && queryData && Object.keys(queryData).length !== 0) {
			if (!tabs.some(tab => tab.name === queryData.getFile.name)) {
				setTabs(tabs => [
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

	if (tabs.length === 0) {
		return <main id="main">Select a file from the explorer.</main>
	}
	return (
		<main id="main">
			<Tabs>
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
						<TabPanel key={index}>{tab.content}</TabPanel>
					))}
				</TabPanels>
			</Tabs>
		</main>
	)
}

export default Main
