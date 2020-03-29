import { expect } from 'chai';
import MaximumFlow from "./algorithms/flow";
import { Graph } from "./graph/graph";
import Dijkstra from "./algorithms/dijkstra";
import { Numbering } from "./algorithms/numbering";
import { StronglyConnectedGroups } from "./algorithms/scc";
import MapMatrixGraph from "./graph/mapmatrixgraph";
import { num, nums, numsMat, charsMat } from "./util/input";
import { createMat, mapMat } from "./util/array";
import { NumMatrix } from './math/nummatrix';
import { MatrixGraph } from './graph/matgraph';
import { AdjacencyMatrixGraph } from './graph/adjmatgraph';
import { walkDeep } from './algorithms/walk/deep';
import { walkLayers } from './algorithms/walk/layer';
import { Flood } from './algorithms/flood';

describe("Parsing", () => {
	let input = [
		"0",
		"1 2 3 1 2",
		"2 3 4 5",
		"2 3 4 5",
		"1 3 4 4",
		"7 3 4 5",
	];

	it("should parse single number from input", () => {
		expect(num(input[0])).equals(0);
	});

	it("should parse list of numbers from input line", () => {
		expect(nums(input[1])).eql([1, 2, 3, 1, 2]);
	});

	it("should parse numbers matrix from input", () => {
		expect(numsMat(input.slice(2))).eql([
			[2, 3, 4, 5],
			[2, 3, 4, 5],
			[1, 3, 4, 4],
			[7, 3, 4, 5]
		]);
	});
});

describe("Walking", () => {
	it("should walk deeply", () => {
		let sequence = [];
		let deepWalker = walkDeep(1, 3);
		let i = 1;
		let res;

		while(!(res = deepWalker.next([i * 2, i * 4])).done) {
			sequence.push(res.value);
			i = res.value;
		}

		expect(sequence).eql([
			1, 2, 4, 8, 16, 8, 16, 32, 4, 8, 16, 32, 16, 32, 64
		]);
	});

	it("should walk by layer with same code", () => {
		let sequence = [];
		let deepWalker = walkLayers(1, 3);
		let i = 1;
		let res;

		while(!(res = deepWalker.next([i * 2, i * 4])).done) {
			sequence.push(res.value);
			i = res.value;
		}

		expect(sequence).eql([
			1, 2, 4, 4, 8, 8, 16, 8, 16, 16, 32, 16, 32, 32, 64
		]);
	});
	
});

describe("Flood", () => {
	let map = [
		"....###...........3.",
		"..1#..#........###..",
		"...##.#....2...#.#..",
		"......#........#.#..",
		"....###.........#...",
		"....#..............."
	];

	let flood = new Flood<string>(charsMat(map));

	it("should flood without overlap", () => {
		flood.blocking = ["#"];
		flood.expand = ["1"];
		flood.flood();
		
		expect(flood.map).to.eql(charsMat([
			"1111###...........3.",
			"111#11#........###..",
			"111##1#....2...#.#..",
			"111111#........#.#..",
			"1111###.........#...",
			"1111#..............."
		]));
	});

	it("should allow to teleport on borders", () => {
		flood.blocking = ["#", "2"];
		flood.expand = ["3"];
		flood.allowOutBounds = true;

		flood.flood();
		
		expect(flood.map).to.eql(charsMat([
			"3333###3333333333333",
			"333#33#33333333###33",
			"333##3#33332333#.#33",
			"333333#33333333#.#33",
			"3333###333333333#333",
			"3333#333333333333333"
		]));
	});

	it("should allow diagonal movement", () => {
		flood.blocking = ["#"];
		flood.expand = ["2"];
		flood.allowOutBounds = false;

		flood.directions = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

		flood.flood();
		
		expect(flood.map).to.eql(charsMat([
			"3333###2222222222222",
			"333#33#22222222###22",
			"333##3#22222222#2#22",
			"333333#22222222#2#22",
			"3333###222222222#222",
			"3333#222222222222222"
		]));
	});
});

describe("Matrix", () => {
	it('should be generated with function', () => {
		let m = createMat<number>(30, 20, (line, col) => line - col);

		m.forEach((line, y) => {
			line.forEach((line, x) => {
				expect(m[y][x]).to.be.eq(y - x);
			})
		})
	});

	it('should be created with default values', () => {
		let m = createMat<string>(30, 20, "oui");

		m.forEach((line, y) => {
			line.forEach((line, x) => {
				expect(m[y][x]).to.be.eq("oui");
			})
		})
	});
});

describe("Numerical matrix", () => {
	/**
	 * A = 1 1
	 *     1 0
	 * 
	 * B = 0 0
	 *     2 1
	 *     3 7
	 * 
	 * C = B*A = 0  0
	 *           3  2
	 *           10 3
	 */
	let A = new NumMatrix([[1, 1], [1, 0]]);
	let B = new NumMatrix([[0, 0], [2, 1], [3, 7]]);
	let C = new NumMatrix([[0, 0], [3, 2], [10, 3]]);

	it('should multiply', () => {
		expect(() => {
			expect(B.mult(A)).to.be.eql(C);
		}).to.not.throw();
	});

	it('should add', () => {
		expect(() => {
			expect(C.add(B)).to.be.eql([
				[0, 0], [5, 3], [13, 10]
			]);
		}).to.not.throw();
	});

	it('should refuse invalid multiplication', () => {
		expect(() => A.mult(B)).to.throw();
	});

});

describe("Graph", () => {
	let M: MatrixGraph;
	let N: AdjacencyMatrixGraph;
	let O: MapMatrixGraph;
	let start = 0;
	let end = 4;

	it("should be created by MatrixGraph", () => {
		M = new MatrixGraph(createMat<number>(5, 5, 0));
		M.oriented = true;

		M.link(start, 1, 1);
		M.link(start, 2, 4);
		M.link(1, end, 5);
		M.link(2, 1, 2);
		M.link(2, 3, 2);
		M.link(3, end, 3);
		
		[
			[0, 1, 4, 0, 0],
			[0, 0, 0, 0, 5],
			[0, 2, 0, 2, 0],
			[0, 0, 0, 0, 3],
			[0, 0, 0, 0, 0]
		].forEach((line, i) => {
			expect(line).eql(M[i]);
		});
	});

	it("should be created by AdacencyMatrixGraph", () => {
		N = new AdjacencyMatrixGraph(10);

		[
			// Numbered 1
			[4, 3], [4, 0], [4, 6],
			// Numbered 2
			[3, 6], [3, 2], [3, 1],
			// Numbered 3
			[6, 2], [6, 5],
			// Numbered 4
			[2, 5],
			// Numbered 5 group
			[5, 1], [5, 9], [9, 8], [8, 5], [8, 7],
			// Numbered 6
			[1, 0],
			// Numbered 7
			[0, 7],
		].forEach((tuple) => N.link(tuple[0], tuple[1]));


		let ref = [
			[7], [0], [5], [1, 2, 6], [0, 3, 6], [1, 9], [2, 5], [], [5, 7], [8]
		];
		N.forEach((line, i) => {
			expect(line.sort(), "node " + i).to.be.eql(ref[i]);
		})
	});

	it("should be created by MapMatrixGraph", () => {
		let start = [-1, -1];
		let end = [-1, -1];

		O = MapMatrixGraph.fromCharArray([
			"s__",
			"_w_",
			"_ww",
			"__e"
		], {
			'_': 1, // cost 1 to travel
			'w': -1, // blocking
			's': (i, j) => {
				start = [i, j];
				return 1;
			},
			'e': (i, j) => {
				end = [i, j];
				return 1;
			}
		});

		// Links that should be generated
		let reference = [
			[0, 1], [0, 3], [1, 2], [3, 6], [6, 9], [9, 10], [10, 11], [2, 5]
		];
		let count = new Array(reference.length).fill(0);

		O.forEachLink((source, dest) => {
			let min = Math.min(source, dest);
			let max = Math.max(source, dest);

			// Each link should refer to a given reference
			expect(reference.some(
				(tuple, i) => {
					if (min === tuple[0] && max == tuple[1]) {
						count[i] += 1;
						return true;
					}

					return false;
				}
			)).to.be.true;	
		});

		// And all links must be defined in both direction
		expect(count).to.be.eql(new Array(reference.length).fill(2));
	});

	describe("Flow", () => {
		let flow: MaximumFlow;

		it("should init", () => {
			flow = new MaximumFlow(M);
		});

		it("should safely compute flow", () => {
			expect(flow.compute(start, end)).to.be.equal(5);
			expect(flow.flow.values).to.eql([
				[0, 1, 4, 0, 0],
				[0, 0, 0, 0, 3],
				[0, 2, 0, 2, 0],
				[0, 0, 0, 0, 2],
				[0, 0, 0, 0, 0]
			]);
		});
	});

	describe("Dijkstra", () => {
		let dij: Dijkstra;

		it("should init", () => {
			// Add one link to test ability to handle loops
			M.link(1, 2, 1);

			dij = new Dijkstra(M);
		});

		it("should safely compute best path", () => {
			dij.compute(start, end);

			expect(dij.cost.values).to.eql([
				0, 1, 2, 4, 6
			]);
		});
	});

	describe("Strongly connected components", () => {
		let scc: StronglyConnectedGroups;
		let simplified: Graph;

		it("should init", () => {
			scc = new StronglyConnectedGroups(N);
		});

		it("should compute groups", () => {
			scc.cluster();
			let groups = scc.group.values;
			
			// 5, 8 and 9 should be grouped together
			expect(groups[5]).to.be.eql(groups[8]);
			expect(groups[9]).to.be.eql(groups[8]);

			// All other one should have single group
			groups.forEach((group, node) => {
				if (node != 5 && node != 9 && node != 8) {
					expect(groups.indexOf(group) == groups.lastIndexOf(group))
						.to.be.true;
				}
			});
		});

		it("should create simplified graph from groups", () => {
			simplified = scc.simplify();

			// Only one group (5, 8, 9)
			expect(simplified.size()).to.be.equals(N.size() - 2);
		});

		describe("Numbering", () => {
			let num: Numbering;
	
			it("shoud init", () => {
				num = new Numbering(N);
			});
	
			it("should compute numbers based on simplified group", () => {
				num.number();
				expect(num.nodeNumber.values).to.be.eql(
					[6, 5, 3, 1, 0, 4, 2, 7, 4, 4]
				);
			});
		});
	})
	
});