import {dirname} from 'path';
import {fileURLToPath} from 'url';

const getDirname = (path) => {
  return dirname(fileURLToPath(path));
};

export default getDirname;
