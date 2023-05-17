import {dirname} from 'path';
import {fileURLToPath} from 'url';

/**
 * @param {string} path
 */
const getDirname = (path) => {
  return dirname(fileURLToPath(path));
};

export default getDirname;
