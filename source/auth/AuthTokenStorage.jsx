
import moment from 'moment';
import uuid from 'uuid';
import {AuthenticationException} from './Error';

class AuthToken {
    constructor(token, user) {
        this.user = user;
        this.value = token || uuid.v4();        
        this.expirationDuration = moment.duration(30, 'minutes');
        this.update(); // sets expirationDate

        if(!this.expirationDate.isValid()) 
            throw new Error("Token expiration date is not a valid date");            
    }

    update() {
        this.expirationDate = moment().add(this.expirationDuration);
    }

    get isValid() {
        return moment().isSameOrAfter(this.expirationDate);
    }
}

export default class AuthTokenStorage {
    constructor() {
        this.tokens = [];
    }

    checkForValidity(token) {
        this.tokens.forEach(function(token) {
            if(token.value == token) {
                return token.isValid;
            }            
        }, this);
    }

    createOrUpdateToken(token, user) {
        this.tokens.forEach(function(token) {
            if(token.value == token) {                
                token.update();
                return token;
            }            
        }, this);

        let nextToken = new AuthToken(token, user);
        this.tokens.push(nextToken);
        return nextToken;
    }

    removeToken(token) {       
        let index = 0
        console.log(this.tokens);

        for(; index < this.tokens.length; index++) {
            if(this.tokens[index].value == token) {
                break;
            }
        }

        if(index != this.tokens.length) {
            this.tokens.splice(index, 1);
            return true;
        }

        //user was never logged in
        throw "User was not logged In.";
    }
}