

import Plugin from '../utils/plugin/Plugin';

class SitePlugin extends Plugin {
    constructor(factory) {
        super(factory);

        this.factory = factory;

        

    }
}

export default function initPlugin(factory) {
    
    return new SitePlugin(factory);

};