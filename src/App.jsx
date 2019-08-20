import React from 'react'

import Header from './sections/Header'
import Navbar from './sections/Navbar'
import Main from './sections/Main'
import Sidebar from './sections/Sidebar'

const App = () => {
	const [isNavbarCollapsed, setNavbarState] = React.useState(false)
	const [selectedFile, setSelectedFile] = React.useState({
		path: './filesystem',
		type: '',
	})
	const setFile = value =>
		setSelectedFile({
			path: value.path,
			type: value.type,
		})
	return (
		<div
			id="wrapper"
			className={`${isNavbarCollapsed ? 'navbar__collapsed' : ''}`}
		>
			<Header title="File Editor" />
			<Navbar
				isNavbarCollapsed={isNavbarCollapsed}
				setNavbarState={setNavbarState}
				setFile={setFile}
			/>
			<Main selectedFile={selectedFile} />
			<Sidebar />
		</div>
	)
}

export default App
