import { createMat } from "../util/array";
import { Matrix } from "./matrix";

export class NumMatrix extends Matrix<number> {
	/**
	 * Multiply this matrix with another matrix
	 * @param m other matrix 
	 */
	mult(m: NumMatrix): NumMatrix {
		// Resulting values
		let w = m.w;
		let h = this.h;

		if (m.h != this.w) {
			throw `imcompatible matrixes for multiplication (${this.h}x${this.w} with ${m.h}x${m.w})`
		}

		let result = createMat<number>(h, w, 0);

		// Each result cell (Line and Column)
		for (let l = 0; l < h; l++) {
			for (let c = 0; c < w; c++) {

				// Vector product this(l, 1..n) * m(1..n, c)
				for (let i = 0; i < m.h; i++) {
					result[l][c] += this[l][i] * m[i][c];
				}
			}
		}

		return new NumMatrix(result);
	}

	/**
	 * Add given matrix to this one
	 * @param matrix matrix to be added 
	 */
	add(matrix: NumMatrix): this {
		if (matrix.w != this.w || matrix.h != this.h) {
			throw "matrixes are not the same size, cant perform addition";
		}

		for (let i = 0; i < this.h; i ++) {
			for (let j = 0; j < this.w; j ++) {
				this[i][j] += matrix[i][j];
			}
		}

		return this;
	}

}