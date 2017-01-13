import electron, { remote } from 'electron';
import { parseString } from 'xml2js';
import path from 'path';
import semver from 'semver';
import request from 'request';


export const getPath = () => {
  const savePath = (remote || electron).app.getPath('userData');
  return path.resolve(`${savePath}/extensions`);
};

export const isUpdated = chromeStoreID => new Promise((resolve, reject) => {
  request.get(
      `https://clients2.google.com/service/update2/crx?x=id%3D${chromeStoreID}%26uc&prodversion=32`,
      (error, response, body) => {
        if (!error && response.statusCode === 200) {
          parseString(body, (err, result) => {
            const newestVersion = result.gupdate.app[0].updatecheck[0].$.version;
            const currentVersion = require(path.resolve(getPath(), chromeStoreID, 'manifest.json')).version; // eslint-disable-line global-require
            console.log(currentVersion);
            if (semver.gt(newestVersion, currentVersion)) resolve(false);
            else resolve(true);
          });
        } else {
          reject(`Failed to check current version of ${chromeStoreID}.`);
        }
      }
    );
});
