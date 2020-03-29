import { Algorithm } from "./algorithm";

export class Flood<M> extends Algorithm {
	directions: number[][];
	map: M[][];
	allowOutBounds: boolean;
	blocking: M[];
	expand: M[];

	constructor(map: M[][], diagonal: boolean = false) {
		super();

		this.map = map;
		this.allowOutBounds = false;
		this.blocking = [];
		this.expand = [];

		if (!diagonal) {
			this.directions = [[0, 1], [1, 0], [-1, 0], [0, -1]];
		} else {
			this.directions = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
		}

	}

	setvalue(x: number, y: number, value: M) {
		if (x >= 0 && y >= 0 && x < this.map.length && y < this.map[x].length) {
			if (this.blocking.indexOf(this.map[x][y]) >= 0 || this.expand.indexOf(this.map[x][y]) >= 0) {
				return false;
			}

			this.debug(`set (${x},${y}) to ${value}`);
			this.map[x][y] = value;
			return true;
		}
		
		else if (this.allowOutBounds) {
			this.setvalue(
				(x + this.map.length) % this.map.length,
				(x + this.map[0].length) % this.map[0].length,
				value
			);
		}
	}

	/**
	 * Flood given values into graph
	 */
	flood() {
		let modified = true;

		while(modified) {
			modified = false;
		
			for (let i = 0; i < this.map.length; i++) {
				for (let j = 0; j < this.map[i].length; j++) {
					const value = this.map[i][j];

					if (this.expand.indexOf(value) >= 0) {
						this.directions.forEach((dir) => {
							this.debug(`try to expand (${i},${j}) to (${i+dir[0]},${j+dir[1]})`)
							if (this.setvalue(i + dir[0], j + dir[1], value)) {
								modified = true;
							}
						});
					}
				}
			}
		}
	}
}