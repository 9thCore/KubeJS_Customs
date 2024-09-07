// Carefully contain the radioactive matter and don't let any of this spill into the environment

(function() {
    const $RecipeSchema = Java.loadClass("dev.latvian.mods.kubejs.recipe.schema.RecipeSchema");
    const commonProperties = []; // Set inside of the registry event

    /**
     * @description Add optional properties which are common to every recipe type
     * @param {object[]} specificProperties Properties specific for this recipe only (i.e. not any shared properties)
     * @returns {object[]} specific + global properties
     */
    const applyCommonProperties = specificProperties => {
        return specificProperties.concat(commonProperties);
    }

    /**
     * @description Add properties common to all recipe types and register the given schema
     * @param {Internal.RecipeSchemaRegistryEventJS} event man this class name is long
     * @param {ResourceLocation} id
     * @param {object[]} specificProperties Properties specific for this recipe only (i.e. without any shared properties)
     */
    const register = (event, id, specificProperties) => {
        event.register(id, new $RecipeSchema(applyCommonProperties(specificProperties)));
    }

    /**
     * @description Get the Convenient Component Helper (TM)
     * @param {Internal.RecipeSchemaRegistryEventJS} event 
     * @returns 
     */
    const convenientComponentHelper = event => {
        return (name, args) => event.components[name](args);
    }

    /**
     * @description Get the Convenient Builder Helper (TM)
     * @param {Internal.RecipeSchemaRegistryEventJS} event 
     * @returns 
     */
    const convenientBuilderHelper = event => {
        return keys => convenientComponentHelper(event)("bool").builder(keys);
    }

    StartupEvents.recipeSchemaRegistry(event => {
        const Component = convenientComponentHelper(event);
        const Builder = convenientBuilderHelper(event);
        
        const itemIn = Component("inputItem").asArrayOrSelf();
        const itemInKey = itemIn.key("item_in");

        const blockIn = Component("inputBlock").asArrayOrSelf();
        const blockInKey = blockIn.key("block_in");

        commonProperties.push(
            LycheePostActions.getAny(Component, Builder).key("post")
        );

        register(event, "lychee:block_interacting", [itemInKey, blockInKey]);
    });
})();