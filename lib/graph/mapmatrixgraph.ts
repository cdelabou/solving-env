import { AdjacencyMatrixGraph } from "./adjmatgraph";

/**
 * Matrix defined by a map
 * 
 * -1 means blocking
 * value >= 0 means weight
 */
export default class MapMatrixGraph extends AdjacencyMatrixGraph {
	mapLineSize: number;

	constructor(map: number[][], diagonal: boolean = false) {
		super(map.length * map[0].length);
		
		this.mapLineSize = map[0].length;

        // Function that bind 2 values in the graph
        let bindIfValid = (i: number, j: number, di: number, dj: number) => {
			if (map.length > i + di && map[i + di].length > j + dj) {
				if (map[i + di][j + dj] >= 0) {
					this.link(this.node(i, j), this.node(i + di, j + dj), map[i][j]);
					this.link(this.node(i + di, j + dj), this.node(i, j), map[i + di][j + dj])
				}
			}
        }

        // Convert to graph
		map.forEach((line, i) => {
			line.forEach((v, j) => {
				if (v >= 0) {
                    bindIfValid(i, j, 1, 0);
                    bindIfValid(i, j, 0, 1);

                    if (diagonal) {
                        bindIfValid(i, j, 1, 1);
                    }
				}
			});
		});
	}

	yx(node: number) {
		return [
			node % this.mapLineSize,
			Math.floor(node / this.mapLineSize)
		]
	}

	node(y: number, x: number) {
        return y * this.mapLineSize + x;
	}

	static fromCharArray(map: string[] | string[][], relation: {[key: string]: number | ((i: number, j: number) => number)},
		diagonal: boolean = false, separator: string = "") {
	   
		let converted: number[][] = [];

		for (let i = 0; i < map.length; i++) {
			let line = map[i];
			
			if (typeof line == "string") {
				line = line.split(separator);
			}

			converted.push(line.map((value, j) => {
				if (!relation.hasOwnProperty(value)) {
					throw `unhandled value ${value}`;
				}
				
				const bound = relation[value];

				if (typeof bound == "number") {
					return bound;
				} else {
					return bound(i, j);
				}
			}));
		}

		return new MapMatrixGraph(converted);
	}
}