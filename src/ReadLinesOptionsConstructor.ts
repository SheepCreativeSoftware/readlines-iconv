type ReadLinesOptionsConstructor = {
	/** Encoding of the file to be read */
	encoding?: string,

	/** Defines the minimum number of bytes to read from file per `next` execution. */
	minBuffer?: number,

	/** To explicitly set the line ending, for Windows: `\r\n`, Unix: `\n`, legacy OSX: `\n` */
	newLineCharacter?: null | '\n' | '\r\n' | '\r',
}

export { ReadLinesOptionsConstructor };
