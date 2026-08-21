import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

/**
 * @param {string} path
 */
const getDirname = (path) => {
  return dirname(fileURLToPath(path));
};

export default getDirname;
