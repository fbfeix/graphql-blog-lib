import {GraphQLScalarType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';

let GraphQLMomentDate = new GraphQLScalarType({
    name: 'Date',
    description: 'The Date scalar type represents textual formated dates in the form YYYY-MM-DD HH:mm:ss.',
    serialize: (value) => {
        if(value.isValid()) {
            return value.format("YYYY-MM-DD HH:mm::ss");
        }

        throw new GraphQLError("Invalid Date for serialization");
    },

    /**
   * Parse value into date
   * @param  {*} value serialized date value
   * @return {moment} date value
   */
    parseValue: (value) => {
        let date = moment(value);
        if(date.isValid());
        return date;
    },

    parseLiteral(ast) {
        if(ast.kind === Kind.STRING) {
            let date = moment(ast.value);
            if(date.isValid())
                return date;
            throw new GraphQLError("Invalid Date for serialization");
        }

        throw new GraphQLError("Wrong Type of Date");
    },
});

export default GraphQLMomentDate;