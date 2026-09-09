import {copyFile, mkdir} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {basename, extname, join} from 'node:path';

const [source, destination = '.nyc_output'] = process.argv.slice(2);

if (!source) {
  throw new TypeError('A source coverage report path is required.');
}

await mkdir(destination, {recursive: true});

const extension = extname(source);
const reportName = basename(source, extension);
await copyFile(
  source,
  join(destination, `${reportName}-${randomUUID()}${extension}`)
);
