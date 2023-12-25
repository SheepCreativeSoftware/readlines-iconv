import * as fs from 'fs/promises';
import { PathLike } from 'fs';
import { ReadLines } from './ReadLines.js';
import { ReadLinesAsyncOptionsConstructor } from './ReadLinesAsyncOptionsConstructor.js';

const zero = 0;
const lastElement = -1;

/** Handler that returns a file line by line, with automatic evaluation of end of line charcter and supports tons of encodings */
class ReadLinesAsync extends ReadLines {
	private filePosition: number;
	private filePath: PathLike;
	private fileHandler: fs.FileHandle | null;

	constructor(filePath: PathLike, {
		encoding='uft8',
		minBuffer=1024,
		newLineCharacter=null,
	}: ReadLinesAsyncOptionsConstructor) {
		super({ encoding, minBuffer, newLineCharacter });
		this.filePosition = zero;
		this.fileHandler = null;
		this.filePath = filePath;
	}

	public async open() {
		if(this.fileHandler !== null) return;
		this.fileHandler = await fs.open(this.filePath, 'r');
	}

	public async close() {
		if(this.fileHandler === null) return;
		await this.fileHandler.close();
		this.fileHandler = null;
		this.reset();
	}

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

	public async next(): Promise<string | null> {
		if(this.fileHandler === null) return null;

		if(this.getLinesCached().length === zero) await this.readChunk();

		if(this.isEndOfLineReached() && this.getLinesCached().length === zero) {
			this.close();
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

export { ReadLinesAsync, ReadLinesAsyncOptionsConstructor as ReadLinesAsyncOptions };
