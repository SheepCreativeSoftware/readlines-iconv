# readlines-iconv

[![NPM Version](https://img.shields.io/npm/v/readlines-iconv.svg)](https://www.npmjs.com/package/readlines-iconv)
[![NPM Downloads](https://img.shields.io/npm/dt/readlines-iconv.svg)](https://www.npmjs.com/package/readlines-iconv)
[![GitHub](https://img.shields.io/github/license/SheepCreativeSoftware/readlines-iconv)](https://github.com/SheepCreativeSoftware/readlines-iconv)
[![node-lts](https://img.shields.io/node/v-lts/readlines-iconv)](https://www.npmjs.com/package/readlines-iconv)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=RG6PSXR828X94)


## Description
Handler that returns a file line by line **synchronously** or **asynchronously**.  
It includes per default a evaluation of the end of line character of the file (CRLF, LF, CR).
It supports a lot of possible encodings thankfully to the integrated [iconv-lite module](https://www.npmjs.com/package/iconv-lite).

See for supported encodings on the [iconv-lite module page](https://www.npmjs.com/package/iconv-lite) or [all supported encodings on their wiki](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings).

## Installation
```bash
npm i readlines-iconv

```

## Basic Usage
The readlines-iconv module can be loaded using ESM:
```js
import { ReadLinesSync } from 'readlines-iconv';
```

### Synchronous example
It is synchronously, but it only reads in (per `next()`) either the specified bytes from `minBuffer` (default: 16384) or the multiples of these specified bytes, until it reaches a valid line ending or the end of the file.
So, it is blocking for the minimum amount of time to evaluate at least one line.  

First you need to integrate readlines-iconv into your application:
```js
const lineHandler = new ReadLinesSync(options);
fileHandler.open('./directory/someFile.txt');
```

Each time when you execute `next()` it will return one line of the file:
```js
let line = lineHandler.next();
```
The `next()` method will return a `string` for each line.
*It will return `null` in case the end of file is reached.*

It will autommatically close the file handle at the end of the file.
But you can close the file handle at any time manually (And you should):
```js
lineHandler.close();
```
*Note: subsequent `next()` calls will return `null`*

After you closed the file, you are able to open a new file without the need to create a new instance using `open()`.
But this will only work if the `options` and line ending of all files opened are the same.


### Promise/Asynchronous example
Each of the functions returns a promise, but handling is basically the same as for the synchronous version.
It only reads in (per `next()`) either the specified bytes from `minBuffer` (default: 16384) or the multiples of these specified bytes, until it reaches a valid line ending or the end of the file.  
It can be used using Promise prototype methods like `.then()` or `.catch()`.  
Or simply by using `async` and `await`.  next()

First you need to integrate readlines-iconv into your application:
```js
const lineHandler = new ReadLinesSync(options);
await fileHandler.open('./directory/someFile.txt');
```

Each time when you execute `next()` it will return one line of the file:
```js
let line = await lineHandler.next();
```
The `next()` method will return a `string` for each line.  
*It will return `null` in case the end of file is reached.*

It will autommatically close the file handle at the end of the file.  
But you can close the file handle at any time manually:
```js
await lineHandler.close();
```
*Note: subsequent next() calls will return `null`*

After you closed the file, you are able to open a new file without the need to create a new instance.  
But this will only work if the `options` and line ending of all files opened are the same.

## Configuring readlines-iconv
The configuration is optional. Without any manual configuration, readlines-iconv tries to use reasonable defaults.  
However, sometimes you may need to change it's configuration.

You can apply a configuration when starting a new instance of readlines-iconv by providing an object.
```js
const lineHandler = new ReadLinesSync(filePath, options);
```

### Options
The object can have following options:

#### options.encoding

Type: `string` Default: `utf8`

See for supported encodings on the [iconv-lite module page](https://www.npmjs.com/package/iconv-lite) or [all supported encodings on their wiki](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings).

#### options.minBuffer

Type: `number` Default: `16384` (*16 kiB*)

Defines the minimum number of bytes to read from file per `next` execution.  
The best fit for the amount of the minimum used memory and performance, would be the averange bytes each of the lines has.  
If it is to small it will slow down the overall perofrmance.  
*`16384` is the default from `fs.read`*

#### options.newLineCharacter

Type: `null | '\n' | '\r\n' | '\r'` Default: `null`

readlines-iconv tries to evaluate the specific line ending by itself.  
To explicitly set the line ending, use the `newLineCharacter` property (e.g. for Windows: `\r\n`, Unix: `\n`, legacy OSX: `\n`).  
`null` means it will be automatically evaluated.  

## License
Copyright (c) 2023-2024 Marina Egner ([sheepcs.de](https://sheepcs.de)). This is free software and may be redistributed under the terms specified in the LICENSE file.
