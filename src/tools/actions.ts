import { Session } from "inspector";

type Action = (session: Session) => any

export const sessionActions: { [name: string]: Action } = {
	run: (session) => {
		
	},
	watch: (session) => {

	},
	export: () => {

	},
	next: () => {

	},
	previous: () => {
		
	}
};