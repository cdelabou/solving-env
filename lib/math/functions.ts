export function distance(p1: number[], p2: number[]) {
	let sum = 0;

	for (let i = 0; i < p1.length; i++) {
		sum += Math.pow(p1[i] - p2[i], 2);
	}

	return Math.sqrt(sum); 
}