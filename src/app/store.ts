import fs from 'fs';
import {jsonStoreFileName} from './constants';

class Store {
  store: any;

  constructor() {
    if (fs.existsSync(jsonStoreFileName)) {
      fs.readFile(jsonStoreFileName, (err, data) => {
          if (err) {
              console.log('err', err)
              throw err;
          }
          this.store =  JSON.parse(data.toString());
      });
    }
  }

  getBotAccessToken() {
    return this.store.bot_access_token
  }
}

export default new Store();
