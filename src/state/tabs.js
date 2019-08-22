export const initialState = {
	tabs: [],
	currentTab: 0,
}

export const reducer = (state, action) => {
	switch (action.type) {
		case 'addTab': {
			if (!state.tabs.some(tab => tab.name === action.payload.name)) {
				return {
					tabs: [
						...state.tabs,
						{
							name: action.payload.name,
							content: JSON.parse(action.payload.content),
						},
					],
					currentTab:
						state.tabs.length === 0 ? 0 : state.currentTab + 1,
				}
			}
			return {
				...state,
				currentTab: state.tabs.findIndex(
					tab => tab.name === action.payload.name
				),
			}
		}
		case 'removeTab':
			return {
				tabs: [
					...state.tabs.filter(
						(_, tabIndex) => tabIndex !== action.payload
					),
				],
				currentTab: state.currentTab === 0 ? 0 : state.currentTab - 1,
			}
		case 'setTabIndex':
			return {
				...state,
				currentTab: action.payload,
			}
		default:
			return state
	}
}
