
import Sequelize from 'sequelize';
import Promise from 'promise';
import uuid from 'uuid';
import validator, {isEmail} from 'validator';
import Faker from 'faker';
import _ from 'lodash';


let db;



export function InitDatabase(dbConfig) {

    return new Promise((resolve, reject) => {
        let Database = new Sequelize(
            dbConfig.name,
            dbConfig.username,
            dbConfig.password, {
                dialect: dbConfig.dialect,
                host: dbConfig.host,
                pool: {
                    max: dbConfig.pool.max,
                    min: dbConfig.pool.min || 1,
                    idle: dbConfig.pool.idle,
                },
                logging: false,
            }
        );

        Database.authenticate().then((data)=>{
            

            let User = Database.define('user', {
                id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    primaryKey: true
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        isEmail: true,
                        notEmpty: true
                    },
                    unique: true
                },
                password: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    validate: {
                        notEmpty: true
                    }
                }
            });

            let Post = Database.define('post', {
                id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    primaryKey: true
                },

                title: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: "",
                    unique: true                    
                },
                text: {
                    type: Sequelize.TEXT,
                    allowNull: false,
                    defaultValue: ""
                }
                
            });

            let Tag = Database.define('tag', {
                id: {
                    type: Sequelize.UUID,
                    allowNull: false,
                    primaryKey: true
                },
                title: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: "",
                    unique: true                    
                },
                description: {
                    type: Sequelize.STRING,
                    allowNull: false,
                    defaultValue: ""
                }
            });

            User.hasMany(Post, {as: 'posts'});
            Post.belongsTo(User);      
                  
            // through param is required!!!
            Tag.belongsToMany(Post, {through: 'PostTags'});
            Post.belongsToMany(Tag, {through: 'PostTags'});
            //Post.hasMany(Tag, {through: 'PostTags'});

            Database.sync({force: true}).then(()=>{

                let runningNr =0;

                User.create({
                    id: uuid.v4(),
                    name: "Always created User (Max, max@example.com, samplePW)",
                    email: "max@example.com",
                    password: "samplePW",
                });

                _.times(10, ()=>{
                    return User.create({
                        id: uuid.v4(),
                        name: Faker.name.firstName(),
                        email: Faker.internet.email(),
                        password: Faker.internet.userName(),
                    }).then(user => {
                        _.times(5, () => {
                            return user.createPost({
                                id: uuid.v4(),
                                title: Faker.lorem.words(),
                                text: Faker.lorem.paragraphs()                                
                            }).then(post =>{
                                _.times(6, () =>{
                                    return post.createTag({
                                        id: uuid.v4(),
                                        title: Faker.lorem.word() + (++runningNr),
                                        description: Faker.lorem.sentence()
                                    })
                                })
                            })
                        });
                    });
                });

                resolve({
                    Database,
                    models: {
                        User,
                        Post,
                        Tag
                    }
                });
                
                
                

                


            }).catch((err)=> {
                
                console.error(err);
                reject(err);


            });

            

        }).catch((err)=>{
            reject(err);
        });

        //console.log(Database);

        
        
        

        

    });
}
