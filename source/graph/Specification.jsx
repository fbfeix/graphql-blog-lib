
import GraphQL, {
    GraphQLSchema, 
    GraphQLQuery, 
    GraphQLObjectType,    
    GraphQLNonNull,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLString,
    GraphQLList
} from 'graphql';
import GraphQLMomentDate from'./GraphQLMomentDate';

import {resolver} from 'graphql-sequelize';
import {AuthenticationException} from '../auth/Error';

export default function InitGraphQL(factory) {

    let dbMap = factory.blog.dbMap;
    let tokenStorage = factory.blog.tokenStorage;


    return new Promise((resolve, reject) => {    
        
        let TagType = new GraphQLObjectType({
            name: 'Tag',
            description: 'A simple tag specifies a topic,etc',
            fields: {
                id: {type: GraphQLString},
                title: {type: GraphQLString},
                description: {type: GraphQLString}
            }
        })

        let PostType = new GraphQLObjectType({
            name: 'Post',
            description: 'A simple Post Type',
            fields() {
                return {
                    id: {type: GraphQLString},
                    title: {type: GraphQLString},
                    text: {type: GraphQLString},
                    tags: {
                        type: new GraphQLList(TagType),
                        resolve(post) {
                            return post.getTags();
                        }
                    },
                    owner: {
                        type: UserType,
                        resolve(post) {
                            return post.getUser();
                        }
                    }
                }
            }
        });

        let UserType = new GraphQLObjectType({
            name: 'User',
            fields: {
                id:     {type: GraphQLString},
                name:   {type: GraphQLString},
                password: {type: GraphQLString},
                authToken: {type: GraphQLString},
                email:  {
                    type: GraphQLString,
                    resolve(user, context) {
                        console.debug(context);
                        
                        return null;
                        return "securizable:" + user.email;
                    }
                },
                posts:  {
                    type: new GraphQLList(PostType),
                    resolve(user) {
                        return user.getPosts();
                    }
                }
            }
        });

        let TokenType = new GraphQLObjectType({
            name: 'Token',
            fields: {
                value: {type: GraphQLString},
                expirationDate: {type: GraphQLMomentDate}
            }
        })


        let query = new GraphQLObjectType({
            name: 'Query',
            fields: {
                users: {
                    type: new GraphQLList(UserType),
                    args: {
                        id: {
                            type: GraphQLString
                        }
                    },
                    resolve: (root, args) => {
                        console.log(args);
                        return dbMap.User.findAll({where: args});
                    }
                },

                posts: {
                    type: new GraphQLList(PostType),
                    resolve: (root, args) => {
                        dbMap.Post.findAll({where: args}).then(users => {
                            console.log(users);
                        });
                        return dbMap.Post.findAll({where: args});
                    }
                }
            }
        }); 

        let UserAddMutation = {
            type: UserType,
            description: 'Changes user',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString)},
                email: { type: new GraphQLNonNull(GraphQLString)},
                password: { type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: (root, {name, email, password}) => {
                return dbMap.User.create({name, email, password});
            }
        }

        let UserChangeMutation = {
            type: GraphQLInt,
            description: 'Change a user',
            args: {
                id:  { type: new GraphQLNonNull(GraphQLString)},
                name: { type: GraphQLString},
                email: { type: GraphQLString},
                password: { type: GraphQLString}
            },
            resolve: (root, {id, name, email, password}) => {
                let obj = {};

                if(name != undefined) obj.name = name;
                if(email != undefined) obj.email = email;
                if(password != undefined) obj.password = password;

                return dbMap.User.update(obj, {where: {id}});
            }
        }

        let PostAddMutation = {
            type: PostType,
            description: 'Add a Post',
            args: {
                title: { type: new GraphQLNonNull(GraphQLString)},
                text: { type: new GraphQLNonNull(GraphQLString)},
                tags: {type: new GraphQLList(TagType)}
            }
        }

        let LoginMutation = {
            type: TokenType,
            description: 'Tries to login a user',
            args: {
                email : {type: new GraphQLNonNull(GraphQLString)},
                password : {type: new GraphQLNonNull(GraphQLString)},
                permanent: {type: GraphQLBoolean}
            },
            resolve: (root, {email, password, permanent}, {request, response}) => {                              
                return new Promise((resolve, reject) => {
                    dbMap.User.findOne({where: {email, password}}).then((user) => {
                        if(user != null) {
                            let token = tokenStorage.createOrUpdateToken(null, user)
                            resolve(token);
                        }
                        else {
                            reject(new AuthenticationException("No User found. Is Email or Password wrong?"));
                        }
                    }).catch(err => {
                        reject(new AuthenticationException(err));
                    })
                    
                }) 
            }
        }

        let LogoutMutation = {
            type: GraphQLBoolean,
            description: 'Logout a user',
            args: {
                tokenValue: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve: (root, {tokenValue}) => {
                return tokenStorage.removeToken(tokenValue);
            }
        }

        let mutation = new GraphQLObjectType({
            name: 'mutation',
            fields: {
                // authorization
                login: LoginMutation,
                logout: LogoutMutation,

                addUser: UserAddMutation,
                changeUser: UserChangeMutation
            }
        })

        let Schema = new GraphQLSchema({
            query,
            mutation
        });


        resolve(Schema);


    }); // Promise end
}