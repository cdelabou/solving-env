import { createMat } from "../util/array";

/**
 * A matrix is an array of numbers composed of [height] lines
 * and [width] columns.
 * 
 * To access a value, use m[line][column]
 */
export class Matrix<M> extends Array<M[]> {
	constructor(values: M[][]) {
		super(...values);
	}

	/**
	 * Matrix width
	 */
	get w() {
		return this[0].length;
	}

	/**
	 * Matrix height
	 */
	get h() {
		return this.length;
	}

	/**
	 * Transpose this matrix
	 */
	transpose(): this {
		// Save previous height and width
		let width = this.w;
		let height = this.h;
		let size = Math.max(width, height);
		
		// Mirror values
		for (let i = 0; i < size; i++) {
			for (let j = 0; j <= i; j++) {
				if (!this[i]) {
					this[i] = new Array(height);
				}

				let temp = this[j][i];
				this[j][i] = this[i][j];
				this[i][j] = temp;
			}
		}

		// Truncate widths and height
		this.length = width;
		for (let i = 0; i < width; i++) {
			this[i].length = height;
		}

		return this;
	}

	mapAll<N>(callback: (value: M, line: number, column: number) => N): Matrix<N> {
		return new Matrix(
			createMat<N>(this.h, this.w, (line, col) => {
				return callback(this[line][col], line, col);
			})
		);
	}
}