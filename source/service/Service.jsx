
import express from 'express';
import cookieParser from 'cookie-parser';
import * as algorithm from '../utils/algorithm/algorithm';

export default class Service {
    

    constructor(eventEmitter, expressServer = null, displayGraphiql = false) {
        this.app = expressServer || express();
        this.eventEmitter = eventEmitter;
        this.addDefaultRoutes();        
    }

    addDefaultRoutes() {
        this.app.use(cookieParser());
    }

    startService(port = 8000, callback) {
        this.app.listen(port, callback);
    }

    addRoute(method, path, handler) {
        let self = this;

        this.app[method](path, (req, res) => {
            
            self.eventEmitter.emit(`onService${algorithm.firstLetterUppercase(method)}`, path, req, res);

            handler(req, res);
        });
    }

    get expressApp() {
        return this.app;
    }


}