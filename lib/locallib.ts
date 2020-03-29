import * as readline from 'readline';

const readline_object = readline.createInterface({
    input: process.stdin
});

// Console.log override
let printed = false;

const log = console.log;

console.log = function(...args: any[]) {
    if (printed) {
        process.stdout.write("\n");
    }
    
    process.stdout.write(args.map((arg) => {
        if (arg === null) {
            return "null";
        } else if (arg === undefined) {
            return "undefined";
        }

        return arg.toString()
    }).join(" "));
}