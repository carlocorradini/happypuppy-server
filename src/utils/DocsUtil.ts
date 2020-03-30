import fs from 'fs';
import path from 'path';
import YAML from 'js-yaml';
import { DocsNotFoundError } from './errors';

enum API_VERSION {
  // eslint-disable-next-line no-unused-vars
  V1 = 'v1',
}

export default class DocsUtil {
  public static readonly API_VERSION = API_VERSION;

  public static load(apiVersion: API_VERSION) {
    if (!(apiVersion.toUpperCase() in API_VERSION)) {
      throw new DocsNotFoundError(`Invalid API VERSION, ${apiVersion} is not allowed`);
    }
    return YAML.safeLoad(
      fs.readFileSync(path.join(__dirname, '../docs/api', `${apiVersion}.docs.yaml`), 'utf8')
    );
  }
}
