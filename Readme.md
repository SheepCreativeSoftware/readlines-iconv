# readlines-iconv

[![NPM Version](https://img.shields.io/npm/v/readlines-iconv.svg)](https://www.npmjs.com/package/readlines-iconv)
[![NPM Downloads](https://img.shields.io/npm/dt/readlines-iconv.svg)](https://www.npmjs.com/package/readlines-iconv)
[![GitHub](https://img.shields.io/github/license/SheepCreativeSoftware/readlines-iconv)](https://github.com/SheepCreativeSoftware/readlines-iconv)
[![node-lts](https://img.shields.io/node/v-lts/readlines-iconv)](https://www.npmjs.com/package/readlines-iconv)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=RG6PSXR828X94)


## Description
Handler that returns a file line by line *synchronously*.
It is synchronously, but it only reads in (per `next`) either the specified bytes from `minBuffer` (default: 1024) or the multiples of these specified bytes, until it reaches a valid line ending or the end of the file.  
So, it is blocking for the minimum amount of time to evaluate at least one line.  
It includes per default a evaluation of the end of line character of the file (CRLF, LF, CR).
It supports a lot of possible encodings thankfully to the integrated [iconv-lite module](https://www.npmjs.com/package/iconv-lite).


See for supported encodings on the [iconv-lite module page](https://www.npmjs.com/package/iconv-lite) or [all supported encodings on their wiki](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings).

## Instalation
```bash
npm i readlines-iconv
```
## Basic Usage
The readlines-iconv module can be loaded using ESM:
```js
import { ReadLines } from 'readlines-iconv';
```

First you need to integrate readlines-iconv into your application:
```js
const filePath = './directory/someFile.txt';
const lineHandler = new ReadLines(filePath, options);
```

Each time when you execute `next` it will return one line of the file:
```js
let line = lineHandler.next();
```
The `next` method will return a `string` for each line.
It will return `null` in case the end of file is reached.

It will autommatically close the file handle at the end of the file.
But you can close the file handle at any time manually:
```js
lineHandler.close();
```
*Note: subsequent next() calls will return `null`*

## Configuring readlines-iconv
The configuration is optional. Without any manual configuration, readlines-iconv tries to use reasonable defaults.
However, sometimes you may need to change it's configuration.  

You can apply a configuration when starting a new instance of readlines-iconv by providing an object.
```js
const lineHandler = new ReadLines(filePath, options);
```

### Options
The object can have following options:

#### options.encoding

Type: `string` Default: `utf8`

See for supported encodings on the [iconv-lite module page](https://www.npmjs.com/package/iconv-lite) or [all supported encodings on their wiki](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings).

#### options.minBuffer

Type: `number` Default: `1024`

Defines the minimum number of bytes to read from file per `next` execution.

#### options.newLineCharacter

Type: `null | '\n' | '\r\n' | '\r'` Default: `null`

readlines-iconv tries to evaluate the specific line ending by itself. 
To explicitly set the line ending, use the `newLineCharacter` function

You can change the number of digits after the decimal point, for the percentage value using `percentageFractionDigits`

## License
Copyright (c) 2023-2024 Marina Egner ([sheepcs.de](https://sheepcs.de)). This is free software and may be redistributed under the terms specified in the LICENSE file.
