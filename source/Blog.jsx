
import EventEmitter from 'events';
import Promise from 'promise';
import PluginCmsFactory from './utils/plugin/PluginCmsFactory';
import Bootloader from './Bootloader';
import Service from './service/Service';

var graphqlHTTP = require('express-graphql');
//var graphiql = require('express-graphiql')

export default class Blog {
    constructor() {
        this.name = "";
        this.eventManager = new EventEmitter();
        this.bootloader = new Bootloader();
        this.service = new Service();
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
     * - graphql init
     * - plugin search and load
     * - syncing database
     * - starting webserver
     */
    start() {
        this.bootloader.findConfig().then((config) => {            
            this.bootloader.bootDatabase(config.database).then((tablesObj) => {
                console.log('successfully initialized database');

                this.bootloader.bootGraph(tablesObj).then((schema) => {
                    console.log('successfully initialized graph');

                    

                    this.service.expressApp.use('/', graphqlHTTP({
                        schema: schema,
                        graphiql: true
                    }));
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
