import electron, { remote } from 'electron';
import { parseString } from 'xml2js';
import path from 'path';
import request from 'request';


export const getPath = () => {
  const savePath = (remote || electron).app.getPath('userData');
  return path.resolve(`${savePath}/extensions`);
};

export const isUpdated = (chromeStoreID, currentVersion) => new Promise((resolve, reject) => {
  request.get(
      `https://clients2.google.com/service/update2/crx?x=id%3D${chromeStoreID}%26uc&prodversion=32`,
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          parseString(body, (err, result) => {
            const app = result.gupdate.app[0].$;
            if (app.status !== 'ok') return resolve(true);

            const { status, version: newestVersion } = result.gupdate.app[0].updatecheck[0].$;
            if (status !== 'ok') return resolve(true);

            if (newestVersion !== currentVersion) return resolve(false);
            return resolve(true);
          });
        } else {
          reject(`Failed to check current version of ${chromeStoreID}.`);
        }
      }
    );
});
