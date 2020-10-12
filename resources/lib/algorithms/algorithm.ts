export class Algorithm {
	verbose: boolean;

	constructor() {
		this.verbose = false;
	}
	
	debug(...args: any[]) {
		if (this.verbose) {
			console.log(...args);
		}
	}
}