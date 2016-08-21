
import EventEmitter from 'events';
import Promise from 'promise';
import PluginCmsFactory from './utils/plugin/PluginCmsFactory';
import Bootloader from './Bootloader';
import Service from './service/Service';
import AuthTokenStorage from './auth/AuthTokenStorage';


// building blocks
import exportSchema from './graph/build/buildRelaySchema';

let passport = require('passport');
var graphqlHTTP = require('express-graphql');

export default class Blog {
    constructor(config = null) {
        this.name = "";
        this.eventManager = new EventEmitter();
        this.bootloader = new Bootloader();
        this.service = new Service();
        this.dbMap = null;
        this.tokenStorage = new AuthTokenStorage();
        this.config = config;
    }

    tryRegisterPlugin(pluginFilename) {
        let self = this;

        return new Promise((resolve, reject) => {
            try {
                resolve(require(pluginFilename)(new PluginCmsFactory(self)));                
            } catch(e) {
                reject(e);
            }
        });
    }

    /**
     * loads all Plugins
     */
    load(listOfPluginFilenames) {
        for(let file of listOfPluginFilenames) {
            this.tryRegisterPlugin(file).then(() => {
                console.log(`${file} loaded successfully`);
            }).catch(err => {
                console.error(`failed loading ${file}. Blog may run in instable mode`);
            });
        }
    }

    /**
     * starts a bunch of processes, namely and in this order:
     * - config finding and loading
     * - database init     
     * - init passport
     * - graphql init
     * - plugin search and load
     * - syncing database     
     * - starting webserver
     */
    start() {
        this.bootloader.findConfig().then((newconfig) => {          

            let config = this.config || newconfig;

            this.bootloader.bootDatabase(config.database).then((tablesObj) => {
                console.log('successfully initialized database');
                this.dbMap = tablesObj;

                this.bootloader.bootGraph(new PluginCmsFactory(this)).then((schema) => {
                    console.log('successfully initialized graph');

                    /* apply schema */
                    exportSchema(schema, config.graphql.targetFolder);

                    this.service.expressApp.use('/', graphqlHTTP((request, response) => ({
                        schema: schema,
                        graphiql: true,
                        context: {
                            request, 
                            response,
                            userToken: request.cookies.authToken
                        }
                    })));

                    this.service.startService();
                    


                }).catch((err) => {
                    console.error('failed initialization of graph: ', err);
                })

            }).catch((err) => {
                console.error('failed initialization of database: ', err);
            });
            
        }).catch((err) => {
            throw err;
        });
        
    }
}
