import { readdirSync, statSync, createWriteStream, createReadStream } from "fs";
import { whichZipQuestionFactory, clearSetsQuestion } from "./questions";
import { resolve } from "path";
import { Session } from "./session";
import inquirer = require("inquirer");
import chalk = require("chalk");
import unzipper = require("unzipper");

export async function fetchExamples(session: Session) {
	const downloadsFolder = session.globalConfig.downloadsFolder;
	let options: { name: string, creation: number }[] = [];

	// Find all zip possible options in the download folder
	readdirSync(downloadsFolder).forEach(file => {
		// Only consider zip files
		if (file.endsWith(".zip")) {
			const path = downloadsFolder + "/" + file;
			options.push({
				name: file,
				creation: statSync(path).birthtimeMs
			})
		}
	});

	options.push({ name: "Abort", creation: -1 });
	options.sort((a, b) => b.creation - a.creation);

	const { fileName } = await inquirer.prompt(
		[whichZipQuestionFactory(options.map(it => it.name))]
	);

	if (fileName != "Abort") {
		const { clearSets } = await inquirer.prompt([clearSetsQuestion]);
		const inputRegex = new RegExp(session.settings!.d.inputFilePattern!);
		const outputRegex = new RegExp(session.settings!.d.outputFilePattern!);

		if (clearSets) {
			// TODO clear
		}

		let count = 0;

		await createReadStream(resolve(downloadsFolder + "/" + fileName))
			.pipe(unzipper.Parse())
			.on('entry', (entry) => {
				const fileName = entry.path as string;
				const file = entry.type === 'File'; // 'Directory' or 'File'
				let match: RegExpMatchArray | null;

				if (file &&  (match = fileName.match(inputRegex)) !== null) {
					entry.pipe(createWriteStream(
						resolve(session.problemPath(`inputs/input${parseInt(match[1])}.txt`))
					));

					count ++;
				} else if (file &&  (match = fileName.match(outputRegex)) !== null) {
					entry.pipe(createWriteStream(
						resolve(session.problemPath(`outputs/output${parseInt(match[1])}.txt`))
					));
				} else {
					entry.autodrain();
				}
			})
			.on("close", () => { console.log(chalk.gray(`${ count } tests copied from ${ fileName } !`)) })
			.promise();
	}
}