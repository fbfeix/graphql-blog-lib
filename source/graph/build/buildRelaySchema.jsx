import fs from 'fs';
import path from 'path';
import { graphql }  from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';


export default function exportSchema(schema, folder) {
  
  const destination = path.join(folder, '/schema.json');

  // Save JSON of full schema introspection for Babel Relay Plugin to use
  (async () => {
    console.log("Building schema.json");

    var result = await (graphql(schema, introspectionQuery));
    if (result.errors) {
      console.error(
        'ERROR introspecting schema: ',
        JSON.stringify(result.errors, null, 2)
      );
    } else {
      fs.writeFileSync(
        destination,
        JSON.stringify(result, null, 2)
      );

      
      console.log(`file written to ${destination}`);

    }
  })();
  

  // Save user readable type system shorthand of schema
  fs.writeFileSync(
    path.join(folder, '/schema.graphql'),
    printSchema(schema)
  );
}