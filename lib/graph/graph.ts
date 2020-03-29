export interface Graph {
	size(): number;

	link(source: number, dest: number, weight: number): void;
	islinked(source: number, dest: number): boolean;
	weight(source: number, dest: number): number;

	successors(i: number): number[];
	predecessors(i: number): number[];

	forEachNode(callback: (source: number) => any): void;
	forEachLink(callback: (source: number, dest: number) => any): void;
}
