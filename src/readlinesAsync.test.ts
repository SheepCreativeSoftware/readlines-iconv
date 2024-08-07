/* eslint-disable no-undef */
/* eslint-disable no-magic-numbers */
import * as assert from 'assert';
import { ReadLinesAsync } from '../src/index.js';

const lines = [
	/* eslint-disable max-len */
	'Eu sit esse aliqua eu sunt consequat in eu nulla cillum. Ad anim excepteur cillum et amet nostrud cillum eu nisi. Voluptate deserunt aliquip proident sint sit. Adipisicing magna sunt amet culpa pariatur commodo tempor et non et mollit duis laboris.',
	'',
	'Magna culpa elit amet pariatur nulla elit irure nulla et anim culpa aliquip. Veniam occaecat exercitation amet deserunt dolor labore consectetur aliquip. Aliquip quis culpa ex aliqua nostrud anim exercitation irure commodo.',
	'',
	'Incididunt proident sunt sunt incididunt mollit consectetur aliqua consequat sit. Amet quis proident ullamco tempor et nisi Lorem id. Velit commodo velit reprehenderit adipisicing veniam dolore pariatur reprehenderit non.',
	'',
	'Voluptate ad esse nisi cillum. Nulla est ad sit consequat. Reprehenderit amet fugiat commodo aliquip aliquip tempor ex minim sit veniam. Irure adipisicing enim sint Lorem. Pariatur aliqua id id labore do ad nulla quis dolor laborum et ullamco officia minim. Ad nisi elit quis fugiat duis. Culpa amet aute laboris esse non.',
	'',
	'Deserunt eu id eu enim. Nisi qui consectetur occaecat eu elit voluptate minim officia commodo cupidatat est et commodo. Et esse aliqua ex dolore anim dolor duis qui enim laboris labore officia consectetur. Lorem proident esse anim labore pariatur officia.',
	'',
	'Commodo sunt sint tempor ipsum non adipisicing cupidatat labore sunt sint nisi et. Nostrud adipisicing ut consequat veniam ut labore nulla laboris adipisicing ut commodo veniam reprehenderit. Laborum ex sunt officia ad reprehenderit eiusmod ad do reprehenderit ut. Aute ullamco irure mollit excepteur. Id proident ad consequat occaecat. Labore nulla adipisicing occaecat officia sit labore proident consequat nostrud laborum fugiat sit. Nisi incididunt ut reprehenderit et esse deserunt eiusmod enim cillum.',
	'',
	'Irure dolore in dolore dolore. Aliquip elit officia labore ipsum nisi irure eu velit aute laboris commodo duis deserunt. Id ullamco sit id et Lorem non ullamco ullamco ad. Tempor excepteur est veniam cupidatat sunt ipsum est non excepteur anim mollit. Aute amet nisi id labore ut reprehenderit consectetur deserunt irure veniam Lorem.',
	'',
	'Mollit ullamco culpa proident eu veniam nulla veniam ea non culpa aute. Dolore aliqua aliqua aliquip ullamco excepteur incididunt eu id enim ad elit deserunt excepteur. Laborum voluptate consequat aliqua excepteur aliqua pariatur mollit ex incididunt excepteur eiusmod ea ut consectetur. Anim exercitation sunt magna laboris ut ipsum ad Lorem Lorem ad ut fugiat. Mollit laboris ex sint nostrud.',
	'',
	'Aliqua cillum et eiusmod laboris dolore tempor ut commodo nostrud esse occaecat tempor minim. Cillum deserunt in nostrud proident. Proident reprehenderit excepteur consectetur et.',
	'',
	'Ea ad velit proident minim exercitation eu do anim sunt. Commodo dolore consequat consectetur ipsum est quis minim sint aliqua occaecat id deserunt. Id aute commodo sint culpa amet id. Proident in officia elit amet ea occaecat eu ea enim aliqua commodo. Do reprehenderit anim irure ullamco ad consequat pariatur cillum laborum consectetur voluptate duis anim. Aliqua sint nisi tempor officia labore.',
];
/* eslint-enable max-len */

describe('#readlinesAsync', function () {
	it('Should return the same text line by line and should end with null', async function () {
		const fileHandler = new ReadLinesAsync({});
		let index = 0;
		await fileHandler.open('./test/textfile.txt');
		for await (const currentLine of fileHandler) {
			assert.deepEqual(currentLine, lines[index]);
			index++;
		}
	});
	it('Should return the same text line by line and should end with null with windows line endings', async function () {
		const fileHandler = new ReadLinesAsync({});
		let index = 0;
		await fileHandler.open('./test/textfileWin.txt');
		for await (const currentLine of fileHandler) {
			assert.deepEqual(currentLine, lines[index]);
			index++;
		}
	});
	it('Should return done with true if closed', async function () {
		const fileHandler = new ReadLinesAsync({});
		await fileHandler.open('./test/textfile.txt');
		await fileHandler.close();
		assert.deepEqual((await fileHandler.next()).done, true);
	});
	it('Should return text with converted encoding', async function () {
		const fileHandler = new ReadLinesAsync({ encoding: 'win1252', newLineCharacter: '\n' });
		await fileHandler.open('./test/textfileWin1252.txt');
		const line = await fileHandler.next();
		assert.deepEqual(line.value, 'ßäöüáéàâ');
		await fileHandler.close();
	});
	it('Should return the same text line by line even in case a wrong line ending has been defined', async function () {
		const fileHandler = new ReadLinesAsync({ newLineCharacter: '\r\n' });
		let index = 0;
		await fileHandler.open('./test/textfile.txt');
		for await (const currentLine of fileHandler) {
			assert.deepEqual(currentLine, lines[index]);
			index++;
		}
	});
	it('Should return the same text line by line even with a buffer of 5', async function () {
		const fileHandler = new ReadLinesAsync({ minBuffer: 5, newLineCharacter: '\r\n' });
		let index = 0;
		await fileHandler.open('./test/textfile.txt');
		for await (const currentLine of fileHandler) {
			assert.deepEqual(currentLine, lines[index]);
			index++;
		}
	});
	it('Should work as normal even after opening another file', async function () {
		const fileHandler = new ReadLinesAsync({});
		let index = 0;
		await fileHandler.open('./test/textfile.txt');
		for await (const currentLine of fileHandler) {
			assert.deepEqual(currentLine, lines[index]);
			index++;
		}
		await fileHandler.close();

		index = 0;
		await fileHandler.open('./test/textfile2.txt');
		for await (const currentLine of fileHandler) {
			let expected = lines[index];
			if (expected !== null) expected += '2';
			assert.deepEqual(currentLine, expected);
			index++;
		}
		await fileHandler.close();
	});
	it('Should return the same text line by line with a file using LF and UTF16', async function () {
		const fileHandler = new ReadLinesAsync({ encoding: 'UTF16-LE' });
		let index = 0;
		await fileHandler.open('./test/textfileUTF16.txt');
		for await (const currentLine of fileHandler) {
			assert.deepEqual(currentLine, lines[index]);
			index++;
		}
	});
	it('Should return the same text line by line with a file using CRLF and UTF16', async function () {
		const fileHandler = new ReadLinesAsync({ encoding: 'UTF16-LE' });
		let index = 0;
		await fileHandler.open('./test/textfileWinUTF16.txt');
		for await (const currentLine of fileHandler) {
			assert.deepEqual(currentLine, lines[index]);
			index++;
		}
	});
	it('Should return the same text line by line with a file using LF (manually defined) and UTF16', async function () {
		const fileHandler = new ReadLinesAsync({ encoding: 'UTF16-LE', 'newLineCharacter': '\n' });
		let index = 0;
		await fileHandler.open('./test/textfileUTF16.txt');
		for await (const currentLine of fileHandler) {
			assert.deepEqual(currentLine, lines[index]);
			index++;
		}
	});
	it('Should return the same text line by line with a file using CRLF (manually defined) and UTF16', async function () {
		const fileHandler = new ReadLinesAsync({ encoding: 'UTF16-LE', newLineCharacter: '\r\n' });
		let index = 0;
		await fileHandler.open('./test/textfileWinUTF16.txt');
		for await (const currentLine of fileHandler) {
			assert.deepEqual(currentLine, lines[index]);
			index++;
		}
	});
});
