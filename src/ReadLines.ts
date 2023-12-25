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
	private lineEnding: {
		unix: Buffer,
		windows: Buffer,
		legacyOsx: Buffer,
	};

	constructor({
		encoding='utf8',
		minBuffer=16384,
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

		// Use iconv to convert new line character(s) as there are differences depending on encoding
		this.lineEnding = {
			legacyOsx: iconv.encode(legacyOsxLineEnding, encoding),
			unix: iconv.encode(unixLineEnding, encoding),
			windows: iconv.encode(windowsLineEnding, encoding),
		};
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

	/** Removes and reutrns the first cached element */
	protected popFirstLineCached() {
		if(this.linesCached.length) {
			const line = this.linesCached.shift();
			if(typeof line !== 'undefined') return line;
		}
		return null;
	}

	/** Reset init params */
	protected reset() {
		this.endOfFileReached = false;
		this.linesCached = [];
		this.lastCachedLine = '';
	}

	/** Returns the line ending of the file and stores this internally for later usage otherwise returns `null` */
	protected getFileLineEnding(fileData: Buffer | undefined): string | null {
		if(typeof fileData === 'undefined') return null;

		// Use iconv to convert new line character(s) as there are differences depending on encoding
		if(this.options.newLineCharacter !== null && fileData.includes(iconv.encode(this.options.newLineCharacter, this.options.encoding))) {
			// ...
			return this.options.newLineCharacter;
		}

		// If cariage return AND line feed included then it must be a windows line ending
		if(fileData.includes(this.lineEnding.windows)) {
			this.options.newLineCharacter = windowsLineEnding;
			return windowsLineEnding;
		}

		// If only one is present then it must be Linux or legacy OSX
		if(fileData.includes(this.lineEnding.unix)) {
			this.options.newLineCharacter = unixLineEnding;
			return unixLineEnding;
		}
		if(fileData.includes(this.lineEnding.legacyOsx)) {
			this.options.newLineCharacter = legacyOsxLineEnding;
			return legacyOsxLineEnding;
		}
		return null;
	}

	/** Turns buffer data into fully converted cached lines */
	protected handleBuffer(buffers: Buffer[], bytesRead: number, totalBytesRead: number) {
		let bufferData = Buffer.concat(buffers);

		if(bytesRead < this.getOptions().minBuffer) {
			this.setEndOfLineReached(true);

			// Remove the end which is filled with zeros
			bufferData = bufferData.subarray(zero, totalBytesRead);
		}

		if(totalBytesRead) this.constructLines(bufferData);
	}

	/** Converts buffer data into single lines */
	private constructLines(bufferData: Buffer) {
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
