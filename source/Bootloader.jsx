import Promise from 'promise';
import fs from 'fs';
import path from 'path';
import { InitDatabase, User } from './database/Database'
import InitGraphQL from './graph/Specification';

export default class Bootloader {
    
    findConfig(orUseThisFilename) {
        return new Promise((resolve, reject) => {
            
            orUseThisFilename 
                ? console.log(`opening file ${orUseThisFilename}`)
                : console.log("searching for config file");

            const filename = orUseThisFilename || "./blog.config.json";

            fs.readFile(filename, (err, data) => {
                if(err) {
                    console.warn(`could not find or open file ${filename}`)
                    console.warn(`now applying default config`)

                    resolve(this.getDefaultConfig());

                } else { 
                    try {
                        const json = JSON.parse(data);                        
                        resolve(json);

                    } catch (jsonErr) {
                        reject(jsonErr);
                    }
                    
                }
            });



        });
    }

    getDefaultConfig() {
        return {
            projectName: "Graphql-Blog",

            database: {
                host: 'localhost',
                username: 'postgres',
                password: 'password',
                dialect: 'postgres',
                name: 'blog',
                pool: {
                    max: 5,
                    min: 0,
                    idle: 10000
                }
            },

            graphql: {
                targetFolder: path.join(__dirname, './graph/public/')
            }
        };
    }

    bootDatabase(dbConfig) {
        console.log(`boot database`);

        return new Promise((resolve, reject) => {
            InitDatabase(dbConfig).then((db, tablesObj)=> {        
                //console.log(db.models);

                resolve(db.models);      
                          
            }).catch((err) => {
                reject(new Error('Failed initialization of database: ', err));
            });
            
        });
    }

    bootGraph(dbMap) {
        console.log(dbMap);
        return InitGraphQL(dbMap);
    }
}