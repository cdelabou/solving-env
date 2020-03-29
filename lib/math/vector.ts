import { NumMatrix } from "./nummatrix";

export class Vector extends NumMatrix {
	constructor(args: number[]) {
		super([args]);
	}

	/**
	 * Compute vectorial product of 2 vectors
	 * @param vector vector to compute with
	 */
	vecprod(vector: Vector): number {
		if (vector.size != this.size) {
			throw "vectors are not the same size";
		}

		let product = 0;

		for (let i = 0; i < this.size; i++) {
			product += this.get(i) * vector.get(i)
		}
		
		return product;
	}

	get(index: number): number {
		if (this.w == 1) {
			return this[index][1];
		} else {
			return this[1][index];
		}
	}

	get size() {
		return this.w == 1 ? this.h : this.w;
	}

	toArray(): number[] {
		let array = new Array(this.size);

		for (let i = 0; i < this.size; i++) {
			array[i] = this.get(i);
		}

		return array;
	}

	static createVec(size: number, column: boolean = false, content: number = 0): Vector {
		let result = new Vector(new Array(size).fill(content));

		if (column) {
			result.transpose();
		}

		return result;
	}
}