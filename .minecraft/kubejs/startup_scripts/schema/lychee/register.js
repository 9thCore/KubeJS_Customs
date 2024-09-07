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
            LycheeSchemaFunctionality.PostActions.getAny(Component, Builder).key("post")
        );

        register(event, "lychee:block_interacting", [itemInKey, blockInKey]);
    });
})();

/**
 * An object that includes all other Lychee recipe schema related objects, such that they don't end up flooding the startup script environment
 * @type {object}
 * @property {object} PostActions - Object that provides interfacing with Lychee recipe Post Actions
 * @property {object} ContextualConditions - Object that provides interfacing with Lychee recipe Contextual Conditions
 * @property {object} ForgeConditions - Object that provides interfacing with Forge Conditions
 * @property {object} FabricConditions - Object that provides interfacing with Fabric Conditions
 * @property {object} DataFixers - Object that provides various data fixers, used to ensure complex data is in the Lychee format
 * @property {object} Validators - Object that provides various validators, used to ensure complex data is correct
 * @property {Function} ComplexData - Constructor of a bare-bones entry in a recipe's Post Actions, Contextual Conditions etc., with an optional validator and data fixer
 */
const LycheeSchemaFunctionality = {
    PostActions: {
        /**
         * @description This method should always return and not error
         * @returns {Internal.RecipeComponent} Component that represents all possible Post Actions
         */
        getAny: () => {
            throw new Error("Not implemented");
        }
    },
    ContextualConditions: {
        /**
         * @description This method should always return and not error
         * @returns {Internal.RecipeComponent} Component that represents all possible Contextual Conditions
         */
        getAny: () => {
            throw new Error("Not implemented");
        }
    },
    ForgeConditions: {
        /**
         * @description If the current modloader is Forge, should return and not error; otherwise, will error
         * @returns {Internal.RecipeComponent} Component that represents all possible Forge Conditions
         */
        getAny: () => {
            throw new Error("Not implemented");
        }
    },
    FabricConditions: {
        /**
         * @description If the current modloader is Fabric, should return and not error; otherwise, will error
         * @returns {Internal.RecipeComponent} Component that represents all possible Fabric Conditions
         */
        getAny: () => {
            throw new Error("Not implemented");
        }
    },
    DataFixers: {
        // Dummy, will be set up later
    },
    Validators: {
        // Dummy, will be set up later
    },
    /**
     * @constructor
     * @param {string} id ID of the object
     * @param {Function} validator Validator run on every component of the object: first arg is key, second arg is value, return value is [passed: boolean, errorMessage: string]
     * @param {Function} dataFixer Fixer for the entire object
     * @returns {{id: string, handler: Function}}
     */
    ComplexData: (id, validator, dataFixer) => {
        throw new Error("Not implemented");
    }
}