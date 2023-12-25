import * as fs from 'fs/promises';
import { PathLike } from 'fs';
import { ReadLines } from './ReadLines.js';
import { ReadLinesOptionsConstructor } from './ReadLinesOptionsConstructor.js';

const zero = 0;
const lastElement = -1;

/** Handler that returns a file line by line, with automatic evaluation of end of line charcter and supports tons of encodings */
class ReadLinesAsync extends ReadLines {
	private filePosition: number;
	private fileHandler: fs.FileHandle | null;

	constructor(options: ReadLinesOptionsConstructor) {
		super(options || {});
		this.filePosition = zero;
		this.fileHandler = null;
	}

	/* Opens a new file */
	public async open(filePath: PathLike) {
		if(this.fileHandler !== null) throw new Error('Cannot open file. A file is already open');
		this.fileHandler = await fs.open(filePath, 'r');
	}

	/* Closes the currently opened file */
	public async close() {
		if(this.fileHandler === null) return;
		await this.fileHandler.close();
		this.filePosition = zero;
		this.fileHandler = null;
		this.reset();
	}

	/** Reads a chunk of data from the file and starts evaluating the lines */
	private async readChunk() {
		if(this.fileHandler === null) throw new Error('File not or no longer open');
		let bytesRead = 0;
		let totalBytesRead = 0;
		const buffers = [] as Buffer[];

		do {
			const readBuffer = Buffer.alloc(this.getOptions().minBuffer);

			const result = await this.fileHandler.read(readBuffer, zero, this.getOptions().minBuffer, this.filePosition);
			bytesRead = result.bytesRead;
			totalBytesRead += bytesRead;

			this.filePosition += bytesRead;

			buffers.push(readBuffer);

			// Will either stop if Line ending has found or if bytes are zero which is the case when at end of file
		} while(bytesRead && this.getFileLineEnding(buffers.at(lastElement)) === null);

		this.handleBuffer(buffers, bytesRead, totalBytesRead);
	}

	/** Returns the next line of the file. Returns `null` in case the end of file has reached */
	public async next(): Promise<string | null> {
		if(this.fileHandler === null) return null;

		if(this.getLinesCached().length === zero) await this.readChunk();

		if(this.isEndOfLineReached() && this.getLinesCached().length === zero) {
			await this.close();
			return null;
		}

		if(this.getLinesCached().length) {
			const line = this.popFirstLineCashed();
			if(line !== null) return line;
			throw new Error('Unexpected undefined line end');
		}
		throw new Error('Unexpected Error: Buffer empty but not at end of file');
	}
}

export { ReadLinesAsync };
