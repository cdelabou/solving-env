export function setupQuestionFactory(choices: string[]) {
	return {
		name: "setup",
		type: "list",
		message: "Which specific setup do you want to use for the session",
		choices
	}
}

export function whichZipQuestionFactory(choices: string[]) {
	return {
		name: "fileName",
		type: "list",
		message: "Which file do you want to import as test sets",
		choices
	}
}

export const clearSetsQuestion = {
	name: "clearSets",
	type: "confirm",
	message: "Do you want to clear the previous test sets",
	default: true
}


export const sessionNameQuestion = {
	name: "name",
	type: "input",
	message: "Please input the session name",
	default: `cp-${ new Date().toLocaleDateString().replace(new RegExp("[ /\t]", "g"), "-") }`,
	validate: (name: string) => new RegExp("[a-zA-Z0-9_-]").test(name)
}

export const actionNameQuestion = {
	type: "list",
	choices: ["run", "watch", "export", "next", "previous"],
	message: "What do you want to do next",
}