import express from 'express';
import configServer from './configServer';

const createServer = (port: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    configServer(express()).then((app) => {
      app
        .listen(port, () => {
          resolve(port);
        })
        .on('error', (ex) => {
          reject(ex.message);
        });
    });
  });
};

export default createServer;
