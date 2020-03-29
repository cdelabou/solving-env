import { Interface as ReadlineInterface } from 'readline';

export function charToInt(char: string) {
	return char.charCodeAt(0);
}

export function intToChar(int: number) {
	return String.fromCharCode(int);
}

export function tuples<M>(array: string[] | string[][], castCallback: (...args: string[]) => M): M[] {
	let result: M[] = [];

	for (let i = 0; i < array.length; i++) {
		let tuple = array[i];

		if (typeof tuple === "string") {
			tuple = tuple.split(" ");
		}

		result.push(castCallback(...tuple));
		
	}

	return result;
}

export function num(value: string | string[]): number {
	if (value instanceof Array) {
		return parseFloat(value[0]);
	}

	return parseFloat(value);
	
}

export function nums(array: string | string[], separator = " "): number[] {
	if (typeof array == "string") {
		return nums(array.split(separator));
	}

	return array.map(parseFloat)
}

export function numsMat(array: string[] | string[][], separator = " "): number[][] {
	let data: number[][] = [];

	for (let i = 0; i < array.length; i++) {
		data.push(nums(array[i], separator))
	}
	
	return data;
}

export function charsMat(array: string[], separator = ""): string[][] {
	let data: string[][] = [];
	
	for (let i = 0; i < array.length; i++) {
		data.push(array[i].split(separator))
	}
	
	return data;
}

export default function read(rl: ReadlineInterface): Promise<string[]> {
	let input: string[] = [];

	return new Promise<string[]>((resolve, reject) => {
		rl.on("line", (value: string) => {
			input.push(value);
		});

		rl.on("close", function() {
			resolve(input);				
		});
	});
}