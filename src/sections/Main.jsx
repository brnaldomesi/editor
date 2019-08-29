import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import socketIOClient from 'socket.io-client'

// Import Tabs Components
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@reach/tabs'

// Import Icons
import {
	CloseIcon,
	CaretLeftIcon,
	CaretRightIcon,
	CaretDownIcon,
	CaretUpIcon,
} from '../assets/Icons'

// Import Queries
import GET_FILE from '../queries/getFile'

// Import Util Functions
import fetchCall from '../utils/fetchCall'
import isJson from '../utils/isJson'

// Import State
import { initialState, reducer } from '../state/tabs'

const Main = ({ selectedFile }) => {
	const [state, dispatch] = React.useReducer(reducer, initialState)
	const { data: queryData } = useQuery(GET_FILE, {
		variables: { path: selectedFile.path },
	})
	React.useEffect(() => {
		if (
			queryData &&
			Object.keys(queryData).length !== 0 &&
			isJson(queryData.getFile.content)
		) {
			dispatch({ type: 'addTab', payload: queryData.getFile })
		}
	}, [queryData, selectedFile])

	React.useEffect(() => {
		const socket = socketIOClient(
			'ec2-18-219-87-48.us-east-2.compute.amazonaws.com:3000'
		)

		socket.on('OpenedFiles', async (from, path) => {
			const url = process.env.REACT_APP_GRAPHQL_URI
			const opts = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					query: `
					query getFile($path: String!) {
						getFile(path: $path) {
							size
							name
							createdAt
							content
						}
					}
				`,
					variables: {
						path,
					},
				}),
			}
			fetchCall(url, opts).then(async data => {
				const { getFile } = await data.data
				if (getFile && getFile.hasOwnProperty('name')) {
					dispatch({ type: 'addTab', payload: getFile })
				}
			})
		})
	}, [])

	if (state.tabs.length === 0) {
		return <main id="main">Select a file from the explorer.</main>
	}
	return (
		<main id="main">
			<Tabs
				index={state.currentTab}
				onChange={index =>
					dispatch({ type: 'setTabIndex', payload: index })
				}
			>
				<TabList>
					{state.tabs.map((tab, index) => (
						<Tab key={index}>
							<span title={tab.name}>{`${
								tab.name.length > 12
									? `${tab.name.slice(0, 10)}...`
									: tab.name
							}`}</span>
							<span
								onClick={e => {
									e.stopPropagation()
									dispatch({
										type: 'removeTab',
										payload: index,
									})
								}}
							>
								{CloseIcon}
							</span>
						</Tab>
					))}
				</TabList>

				<TabPanels>
					{state.tabs.map((tab, index) => (
						<TabPanel key={index}>
							<pre>{JSON.stringify(tab.content, null, 4)}</pre>
						</TabPanel>
					))}
				</TabPanels>
			</Tabs>
			<div id="tabs__navigation">
				<span onClick={() => dispatch({ type: 'leftTab' })}>
					{CaretLeftIcon}
				</span>
				<span onClick={() => dispatch({ type: 'rightTab' })}>
					{CaretRightIcon}
				</span>
				<span
					onClick={() =>
						dispatch({
							type: 'toggleTabDropdown',
							payload: !state.isTabDropDownVisible,
						})
					}
				>
					{state.isTabDropDownVisible ? CaretUpIcon : CaretDownIcon}
				</span>
				{state.isTabDropDownVisible && (
					<div id="tab__options">
						<ul>
							<li
								onClick={() =>
									dispatch({ type: 'closeAllTabs' })
								}
							>
								Close All Tabs
							</li>
						</ul>
					</div>
				)}
			</div>
		</main>
	)
}

export default Main
