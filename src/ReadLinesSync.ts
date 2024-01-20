import * as fs from 'fs';
import { ReadLines } from './ReadLines.js';
import { ReadLinesOptionsConstructor } from './ReadLinesOptionsConstructor.js';

const zero = 0;
const lastElement = -1;

/** Handler that returns a file line by line, with automatic evaluation of end of line charcter and supports tons of encodings */
class ReadLinesSync extends ReadLines {
	private fileDescriptor: number | null;
	private filePosition: number;

	constructor(options: ReadLinesOptionsConstructor) {
		super(options || {});
		this.filePosition = zero;
		this.fileDescriptor = null;
	}

	/* Opens a new file */
	public open(filePath: fs.PathLike) {
		if(this.fileDescriptor !== null) throw new Error('Cannot open file. A file is already open');
		this.fileDescriptor = fs.openSync(filePath, 'r');
	}

	/* Closes the currently opened file */
	public close() {
		if(!this.fileDescriptor) return;
		fs.closeSync(this.fileDescriptor);
		this.filePosition = zero;
		this.fileDescriptor = null;
		this.reset();
	}

	/** Reads a chunk of data from the file and starts evaluating the lines */
	private readChunk() {
		if(this.fileDescriptor === null) throw new Error('File not or no longer open');
		let bytesRead = 0;
		let totalBytesRead = 0;
		const buffers = [] as Buffer[];

		do {
			const readBuffer = Buffer.alloc(this.getOptions().minBuffer);

			bytesRead = fs.readSync(this.fileDescriptor, readBuffer, zero, this.getOptions().minBuffer, this.filePosition);
			totalBytesRead += bytesRead;

			this.filePosition += bytesRead;

			buffers.push(readBuffer);

			// Will either stop if Line ending has found or if bytes are zero which is the case when at end of file
		} while(bytesRead && this.getFileLineEnding(buffers.at(lastElement)) === null);

		this.handleBuffer(buffers, bytesRead, totalBytesRead);
	}

	[Symbol.iterator]() {
		return this;
	}

	/** Returns the next line of the file. Returns `{ done: true }` in case the end of file has reached */
	public next(): IteratorResult<string> {
		// eslint-disable-next-line no-undefined
		if(this.fileDescriptor === null) return { done: true, value: undefined };

		if(this.getLinesCached().length === zero) this.readChunk();

		if(this.isEndOfLineReached() && this.getLinesCached().length === zero) {
			this.close();
			// eslint-disable-next-line no-undefined
			return { done: true, value: undefined };
		}

		if(this.getLinesCached().length) {
			const line = this.popFirstLineCached();
			if(line !== null) return { done: false, value: line };
			throw new Error('Unexpected undefined line end');
		}
		throw new Error('Unexpected Error: Buffer empty but not at end of file');
	}
}

export { ReadLinesSync };
