import React from 'react'

import RenderTree from '../components/RenderTree'

import {
	CollapseLeftIcon,
	CaretLeftIcon,
	CaretRightIcon,
	ExpandRightIcon,
} from '../assets/Icons'

const Navbar = ({
	isNavbarCollapsed,
	setNavbarState,
	setFile,
	selectedFile,
}) => {
	return (
		<aside id="navbar">
			<div id="navbar__header">
				{/* <div id="navbar__header__nav">
					<button>{CaretLeftIcon}</button>
					<button>{CaretRightIcon}</button>
				</div> */}
				<div
					id="navbar__header__collapse"
					onClick={() => setNavbarState(!isNavbarCollapsed)}
				>
					{isNavbarCollapsed ? ExpandRightIcon : CollapseLeftIcon}
				</div>
			</div>
			<div id="navbar__explorer">
				<RenderTree setFile={setFile} />
			</div>
		</aside>
	)
}

export default Navbar
