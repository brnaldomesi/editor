import React from 'react'

import {
	CollapseLeftIcon,
	CaretLeftIcon,
	CaretRightIcon,
	ExpandRightIcon,
} from '../assets/Icons'

const Navbar = ({ isNavbarCollapsed, setNavbarState }) => {
	return (
		<aside id="navbar">
			<div id="navbar__header">
				<div id="navbar__header__nav">
					<button>{CaretLeftIcon}</button>
					<button>{CaretRightIcon}</button>
				</div>
				<div
					id="navbar__header__collapse"
					onClick={() => setNavbarState(!isNavbarCollapsed)}
				>
					{isNavbarCollapsed ? ExpandRightIcon : CollapseLeftIcon}
				</div>
			</div>
		</aside>
	)
}

export default Navbar
