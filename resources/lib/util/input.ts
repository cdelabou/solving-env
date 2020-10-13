import { Interface as ReadlineInterface } from 'readline';


export default function handleInput(rl: ReadlineInterface): InputHandler {
	let inputHandler = new InputHandler();

	rl.on("line", (value: string) => {
		inputHandler.feed(value);
	});

	return inputHandler;
}

class InputHandler {
	private cache: string[] = [];
	private subscriber: undefined | ((content: string) => any);

	constructor() { }

	feed(line: string) {
		if (this.subscriber) {
			const sub = this.subscriber;
			this.subscriber = undefined;
			sub(line);
		} else {
			this.cache.push(line);
		}
	}

	getLine() {
		if (this.cache.length <= 0) {
			return new Promise<string>((res, rej) => {
				this.subscriber = res;
			})
		}

		return Promise.resolve(this.cache.shift()!);
	}

	async tuples<M>(lines: number, castCallback: (...args: string[]) => M, separator = " "): Promise<M[]> {
		let result: M[] = [];
	
		for (let i = 0; i < lines; i++) {
			let line = await this.getLine();
			result.push(castCallback(...line.split(separator)));
		}
	
		return result;
	}
	
	async num() {
		const line = await this.getLine();
		return parseFloat(line);
	}
	
	async nums(separator = " "): Promise<number[]> {
		const line = await this.getLine();
		return line.split(separator).map(parseFloat)
	}
	
	async numsMat(lines: number, separator = " "): Promise<number[][]> {
		let data: number[][] = [];
	
		for (let i = 0; i < lines; i++) {
			const line = await this.nums(separator);
			data.push(line);
		}
		
		return data;
	}
	
	async charsMat(lines: number, separator = ""): Promise<string[][]> {
		let data: string[][] = [];
		
		for (let i = 0; i < lines; i++) {
			const line = await this.getLine();
			data.push(line.split(separator))
		}
		
		return data;
	}
}