import React from 'react'

import { MinimizeIcon, CloseIcon } from '../assets/Icons'

const Header = ({ title }) => {
	return (
		<header id="header">
			<div id="header__title">{title}</div>
			<div id="header__actions">
				<button>{MinimizeIcon}</button>
				<button>{CloseIcon}</button>
			</div>
		</header>
	)
}

export default Header
