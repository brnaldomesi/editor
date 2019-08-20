import React from 'react'

import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs'

import { AddIcon, CloseIcon } from '../assets/Icons'

const Main = () => {
	const [tabs, setTabs] = React.useState([
		{
			name: 'One',
			content: 'Tab1',
		},
		{
			name: 'Two',
			content: 'Tab2',
		},
		{
			name: 'Three',
			content: 'Tab3',
		},
		{
			name: 'Four',
			content: 'Tab4',
		},
	])
	const removeTab = index =>
		setTabs([...tabs.filter((_, tabIndex) => tabIndex !== index)])
	const addTab = () => setTabs([...tabs, { name: 'Five', content: 'Tab5' }])
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
					<Tab onClick={() => addTab()}>{AddIcon}</Tab>
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
