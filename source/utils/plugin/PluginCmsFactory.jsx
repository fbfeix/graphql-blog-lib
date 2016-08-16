

/**
 * Provides a factory environment for Plugins.
 * Through this class, Plugins can edit the CMS (if permitted to do so)
 */
export default class PluginCmsFactory {
    constructor(blog) {
        this.blog = blog;
    }

    installNewEvent(name) {

    }

    emitEvent(name, sourcePlugin) {

    }
    
    addEventListener(name, destinationPlugin) {

    }

    addObjectToGraphQLSchema(obj) {
        this.blog.schema 
    }
}