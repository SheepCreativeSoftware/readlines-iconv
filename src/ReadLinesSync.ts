import * as fs from 'fs';
import { ReadLines } from './ReadLines.js';
import { ReadLinesSyncOptionsConstructor } from './ReadLinesSyncOptionsConstructor.js';

const zero = 0;
const lastElement = -1;

/** Handler that returns a file line by line, with automatic evaluation of end of line charcter and supports tons of encodings */
class ReadLinesSync extends ReadLines {
	private fileDescriptor: number | null;
	private filePosition: number;

	constructor(filePath: fs.PathLike, {
		encoding='uft8',
		minBuffer=1024,
		newLineCharacter=null,
	}: ReadLinesSyncOptionsConstructor) {
		super({ encoding, minBuffer, newLineCharacter });
		this.filePosition = zero;
		this.fileDescriptor = fs.openSync(filePath, 'r');
	}

	public close() {
		if(!this.fileDescriptor) return;
		fs.closeSync(this.fileDescriptor);
		this.fileDescriptor = null;
		this.reset();
	}

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

	public next(): string | null {
		if(this.fileDescriptor === null) return null;

		if(this.getLinesCached().length === zero) this.readChunk();

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

export { ReadLinesSync, ReadLinesSyncOptionsConstructor as ReadLinesSyncOptions };
