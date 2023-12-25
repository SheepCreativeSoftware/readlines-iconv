import iconv from 'iconv-lite';
import { ReadLinesOptions } from './ReadLinesOptions.js';
import { ReadLinesOptionsConstructor } from './ReadLinesOptionsConstructor.js';

const zero = 0;
const unixLineEnding = '\n';
const windowsLineEnding = '\r\n';
const legacyOsxLineEnding = '\r';
const oneElement = 1;

/** Handler that returns a file line by line, with automatic evaluation of end of line charcter and supports tons of encodings */
class ReadLines {
	private options: ReadLinesOptions;
	private endOfFileReached: boolean;
	private linesCached: string[];
	private lastCachedLine: string;

	constructor({
		encoding='utf8',
		minBuffer=1024,
		newLineCharacter=null,
	}: ReadLinesOptionsConstructor) {
		this.options = {
			encoding,
			minBuffer,
			newLineCharacter,
		};
		this.endOfFileReached = false;
		this.linesCached = [];
		this.lastCachedLine = '';
	}

	protected getOptions(): ReadLinesOptions {
		return this.options;
	}

	protected getLinesCached() {
		return this.linesCached;
	}

	protected getLastCachedLine() {
		return this.lastCachedLine;
	}

	protected setEndOfLineReached(value: boolean) {
		this.endOfFileReached = value;
	}

	protected setLastCachedLine(value: string) {
		this.lastCachedLine = value;
	}

	protected isEndOfLineReached() {
		return this.endOfFileReached;
	}

	protected popFirstLineCashed() {
		if(this.linesCached.length) {
			const line = this.linesCached.shift();
			if(typeof line !== 'undefined') return line;
		}
		return null;
	}

	protected reset() {
		this.endOfFileReached = false;
		this.linesCached = [];
		this.lastCachedLine = '';
	}

	protected getFileLineEnding(fileData: Buffer | undefined): string | null {
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

	protected handleBuffer(buffers: Buffer[], bytesRead: number, totalBytesRead: number) {
		let bufferData = Buffer.concat(buffers);

		if(bytesRead < this.getOptions().minBuffer) {
			this.setEndOfLineReached(true);

			// Remove the end which is filled with zeros
			bufferData = bufferData.subarray(zero, totalBytesRead);
		}

		if(totalBytesRead) this.constructLines(bufferData);
	}

	protected constructLines(bufferData: Buffer) {
		let textData = iconv.decode(bufferData, this.options.encoding);

		// Last line is part of this first line if it is not empty
		if(this.lastCachedLine !== '') {
			textData = this.lastCachedLine + textData;
			this.lastCachedLine = '';
		}
		const lines = [];

		// If line ending has not been found then expect, that everything from the file is one single sentence
		if(this.options.newLineCharacter === null) lines.push(textData);
		else lines.push(...textData.split(this.options.newLineCharacter));

		if(!this.endOfFileReached && lines.length > oneElement) {
			// Pop last out for next reading (Is a incomplete string in case it is not empty)
			const lastCachedLine = lines.pop();
			if(typeof lastCachedLine !== 'undefined') this.lastCachedLine = lastCachedLine;
		}

		this.linesCached.push(...lines);
	}
}

export { ReadLines };
