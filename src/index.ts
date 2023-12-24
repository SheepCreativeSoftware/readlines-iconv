import * as fs from 'fs';
import iconv from 'iconv-lite';
import { ReadLinesSyncOptions } from './ReadLinesSyncOptions.js';
import { ReadLinesSyncOptionsConstructor } from './ReadLinesSyncOptionsConstructor.js';

const zero = 0;
const unixLineEnding = '\n';
const windowsLineEnding = '\r\n';
const legacyOsxLineEnding = '\r';
const lastElement = -1;
const oneElement = 1;

/** Handler that returns a file line by line, with automatic evaluation of end of line charcter and supports tons of encodings */
class ReadLinesSync {
	private fileDescriptor: number | null;
	private options: ReadLinesSyncOptions;
	private endOfFileReached: boolean;
	private linesCached: string[];
	private lastCachedLine: string;
	private filePosition: number;

	constructor(filePath: fs.PathLike, {
		encoding='uft8',
		minBuffer=1024,
		newLineCharacter=null,
	}: ReadLinesSyncOptionsConstructor) {
		this.options = {
			encoding,
			minBuffer,
			newLineCharacter,
		};
		this.endOfFileReached = false;
		this.linesCached = [];
		this.filePosition = zero;
		this.lastCachedLine = '';
		this.fileDescriptor = fs.openSync(filePath, 'r');
	}

	private getFileLineEnding(fileData: Buffer | undefined): string | null {
		if(typeof fileData === 'undefined') return null;
		if(this.options.newLineCharacter !== null && fileData.includes(this.options.newLineCharacter)) return this.options.newLineCharacter;

		// If cariage return AND line feed included then it must be a windows line ending
		if(fileData.includes(windowsLineEnding)) {
			this.options.newLineCharacter = windowsLineEnding;
			return windowsLineEnding;
		}

		// If only one is present then it must be Linux or legacy OSX
		if(fileData.includes(unixLineEnding)) {
			this.options.newLineCharacter = unixLineEnding;
			return unixLineEnding;
		}
		if(fileData.includes(legacyOsxLineEnding)) {
			this.options.newLineCharacter = legacyOsxLineEnding;
			return legacyOsxLineEnding;
		}
		return null;
	}

	public close() {
		if(!this.fileDescriptor) return;
		fs.closeSync(this.fileDescriptor);
		this.fileDescriptor = null;
	}

	private readChunk() {
		if(this.fileDescriptor === null) throw new Error('File not or no longer open');
		let bytesRead = 0;
		let totalBytesRead = 0;
		const buffers = [] as Buffer[];

		do {
			const readBuffer = Buffer.alloc(this.options.minBuffer);

			bytesRead = fs.readSync(this.fileDescriptor, readBuffer, zero, this.options.minBuffer, this.filePosition);
			totalBytesRead += bytesRead;

			this.filePosition += bytesRead;

			buffers.push(readBuffer);

			// Will either stop if Line ending has found or if bytes are zero which is the case when at end of file
		} while(bytesRead && this.getFileLineEnding(buffers.at(lastElement)) === null);

		let bufferData = Buffer.concat(buffers);

		if(bytesRead < this.options.minBuffer) {
			this.endOfFileReached = true;

			// Remove the end which is filled with zeros
			bufferData = bufferData.subarray(zero, totalBytesRead);
		}

		if(totalBytesRead) this.constructLines(bufferData);
	}

	private constructLines(bufferData: Buffer) {
		if(this.options.newLineCharacter === null) throw new Error('Invalid Line ending: not found');
		let textData = iconv.decode(bufferData, this.options.encoding);

		// Last line is part of this first line if it is not empty
		if(this.lastCachedLine !== '') {
			textData = this.lastCachedLine + textData;
			this.lastCachedLine = '';
		}
		const lines = textData.split(this.options.newLineCharacter);

		if(!this.endOfFileReached && lines.length > oneElement) {
			// Pop last out for next reading (Is a incomplete string in case it is not empty)
			const lastCachedLine = lines.pop();
			if(typeof lastCachedLine !== 'undefined') this.lastCachedLine = lastCachedLine;
		}

		this.linesCached.push(...lines);
	}

	public next(): string | null {
		if(this.fileDescriptor === null) return null;

		if(this.linesCached.length === zero) this.readChunk();

		if(this.endOfFileReached && this.linesCached.length === zero) {
			this.close();
			return null;
		}

		if(this.linesCached.length) {
			const line = this.linesCached.shift();
			if(typeof line !== 'undefined') return line;
			throw new Error('Unexpected undefined line end');
		}
		throw new Error('Unexpected Error: Buffer empty but not at end of file');
	}
}

export { ReadLinesSync, ReadLinesSyncOptionsConstructor as ReadLinesSyncOptions };
