(function() {
    /**
     * Maximum depth that searches can go for.
     * Increasing or decreasing will have no static change on the performance,
     * but too high a value might trigger a StackOverflow.
     * 
     * Should you really be nesting more than 20 deep, anyway?
     */
    const MAX_DEPTH = 20;

    const $RecipeSchema = Java.loadClass("dev.latvian.mods.kubejs.recipe.schema.RecipeSchema");

    // Set inside of the registry event
    let postActions = undefined;
    const optionalProperties = [];

    /**
     * @description Add properties common to all recipe types and register the given schema
     * @param {Internal.RecipeSchemaRegistryEventJS} event man this class name is long
     * @param {ResourceLocation} id
     * @param {object[]} specificProperties Properties specific for this recipe only (i.e. without any shared properties)
     */
    const register = (event, id, specificProperties) => {
        specificProperties.unshift(postActions);
        event.register(id, new $RecipeSchema(specificProperties.concat(optionalProperties)));
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
        
        const itemIn = Component("inputItem");
        const anyString = Component("anyString");
        const nonBlankString = Component("nonBlankString");
        const bool = Component("bool");
        const positiveInt = Component("intNumber");

        const blockIn = LycheeSchemaFunctionality.Block.BlockPredicate.get(Component, Builder);
        const blockInKey = blockIn.key("block_in").preferred("blockIn");
        const optionalBlockInKey = blockIn.key("block_in").defaultOptional().preferred("blockIn");
        const fallingBlockKey = blockIn.key("falling_block").defaultOptional().preferred("fallingBlock");
        const landingBlockKey = blockIn.key("landing_block").defaultOptional().preferred("landingBlock");
        const sourceBlockKey = blockIn.key("source_block").preferred("sourceBlock");
        const targetBlockKey = blockIn.key("target_block").preferred("targetBlock");

        // grumble grumble lychee and its stupid quality of life and positive additions...
        const anyItemMatch = Builder(
            Component("filteredString", {
                filter: s => s === "lychee:always_true",
                error: `Key type must be "lychee:always_true"`
            }).key(LycheeSchemaFunctionality.Constants.Keys.TYPE)
        );

        // hnngg....
        const emptyHandMatch = Builder(
            Component("filteredString", {
                filter: s => s === "minecraft:air" || s === "air",
                error: `Empty hand match must be one of "minecraft:air" | "air"`
            }).key("item")
        ).asArray().mapIn(object => {
            if (typeof object === "string") {
                return [{
                    item: object
                }];
            } else if (!Array.isArray(object)) {
                return [object];
            }
            return object;
        });

        const specialItem = emptyHandMatch.or(itemIn.or(anyItemMatch)).asArrayOrSelf();
        const specialItemKey = specialItem.key("item_in").preferred("itemIn");
        const optionalSpecialItemKey = specialItem.key("item_in").preferred("itemIn").defaultOptional();

        postActions = LycheeSchemaFunctionality.PostActions.getKey(Component, Builder);        
        optionalProperties.push(
            LycheeSchemaFunctionality.ContextualConditions.getKey(Component, Builder),
            anyString.key("comment").defaultOptional(),
            bool.key("ghost").defaultOptional(),
            bool.key("hide_in_viewer").defaultOptional().preferred("hideInViewer"),
            anyString.key("group").defaultOptional(),
            positiveInt.key("max_repeats").defaultOptional().preferred("maxRepeats")
        );

        const timeKey = positiveInt.key("time").defaultOptional();
        const levelCostKey = positiveInt.key("level_cost").preferred("levelCost").defaultOptional();
        const materialCostKey = positiveInt.key("material_cost").preferred("materialCost").defaultOptional();
        const assemblingKey = LycheeSchemaFunctionality.PostActions.getAny(Component, Builder).key("assembling").defaultOptional();

        const itemOut = Component("outputItem");
        const itemOutKey = itemOut.key("item_out").preferred("itemOut");
        const resultItemKey = itemOut.key("result");

        const character = Component("character");
        const itemKeysetKey = itemIn.asMap(character).key("key");
        const patternKey = nonBlankString.asArray().key("pattern");

        // Platform-specific conditions
        // Forge's don't seem to be doing anything, perhaps KubeJS' recipes run too late?
        // In theory, the user should know what mods, items and tags exist at runtime (as they make the pack)
        // I'll avoid implementing either version now, and will do later if a valid usecase arrives
        if (Platform.isForge()) {
            // commonProperties.push(LycheeSchemaFunctionality.ForgeConditions.getKey(Component, Builder));
        } else if (Platform.isFabric()) {
            // commonProperties.push(LycheeSchemaFunctionality.FabricConditions.getKey(Component, Builder));
        }

        register(event, "lychee:block_interacting", [specialItemKey, blockInKey]);
        register(event, "lychee:block_clicking", [specialItemKey, blockInKey]);
        register(event, "lychee:item_burning", [specialItemKey]);
        register(event, "lychee:item_inside", [specialItemKey, blockInKey, timeKey]);
        register(event, "lychee:anvil_crafting", [specialItemKey, itemOutKey, levelCostKey, materialCostKey, assemblingKey]);
        register(event, "lychee:block_crushing", [optionalSpecialItemKey, fallingBlockKey, landingBlockKey]);
        register(event, "lychee:lightning_channeling", [optionalSpecialItemKey]);
        register(event, "lychee:item_exploding", [optionalSpecialItemKey]);
        register(event, "lychee:block_exploding", [optionalBlockInKey]);
        register(event, "lychee:random_block_ticking", [blockInKey]);
        register(event, "lychee:dripstone_dripping", [sourceBlockKey, targetBlockKey]);
        register(event, "lychee:crafting", [patternKey, itemKeysetKey, resultItemKey, assemblingKey]);
    });

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.MaxDepth = MAX_DEPTH;
    });
})();

/**
 * An object that includes all other Lychee recipe schema related objects, such that they don't end up flooding the startup script environment
 * @type {object}
 * @property {object} Constants - Variety of constants
 * @property {object} Constants.Keys - Common keys that should be exposed
 * @property {object} Constants.InternalKeys - Keys not meant to be used by end users
 * @property {number} MaxDepth - Maximum depth that recursive searches can go for
 * @property {object} LoadedClasses - Object that hosts utility Java classes for use in various components
 * @property {object} PostActions - Object that provides interfacing with Lychee recipe Post Actions
 * @property {object} ContextualConditions - Object that provides interfacing with Lychee recipe Contextual Conditions
 * @property {object} ForgeConditions - Object that provides interfacing with Forge Conditions
 * @property {object} FabricConditions - Object that provides interfacing with Fabric Conditions
 * @property {object} DataFixers - Object that provides various data fixers, used to ensure complex data is in the Lychee format
 * @property {object} Validators - Object that provides various validators, used to ensure complex data is correct
 * @property {Function} ComplexData - Constructor of a bare-bones entry in a recipe's Post Actions, Contextual Conditions etc., with an optional validator and data fixer
 * @property {object} NBTComponent - Object that provides interfacing with the NBT system, particularly getting a Recipe Component representing it
 * @property {object} Block - Grouping of block related Recipe Components
 * @property {object} Block.BlockPredicate - Object that provides interfacing with BlockPredicates, particularly getting a Recipe Component representing it
 * @property {object} Block.StatePropertiesPredicate - Object that provides interfacing with StatePropertiesPredicates, particularly getting a Recipe Component representing it
 * @property {object} Bounds - Grouping of number range related Recipe Components
 * @property {object} Bounds.IntBounds - Object that provides interfacing with IntBounds, particularly getting a Recipe Component representing it
 * @property {object} Bounds.DoubleBounds - Object that provides interfacing with DoubleBounds, particularly getting a Recipe Component representing it
 */
const LycheeSchemaFunctionality = {
    Constants: {
        Keys: {
            TYPE: "type"
        },
        InternalKeys: {
            PARENT: "__parent",
            KEY: "__key",
            ISRECURSIVE: "__isrecursive",
            DATA: "__data",
            PRIMITIVE: "__primitive",
            FROMARRAY: "__fromarray"
        }
    },
    MaxDepth: 0,
    LoadedClasses: {
        $JsonPrimitive: Java.loadClass("com.google.gson.JsonPrimitive"),
        $JsonArray: Java.loadClass("com.google.gson.JsonArray")
    },
    PostActions: {
        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeComponent} Component that represents all possible Post Actions
         */
        getAny: (Component, Builder) => {
            throw new Error("Not implemented");
        },

        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeKey} Key that represents all possible Post Actions
         */
        getKey: (Component, Builder) => {
            return LycheeSchemaFunctionality.PostActions.getAny(Component, Builder).key("post");
        }
    },
    ContextualConditions: {
        /**
         * @description This method should always return and not error
         * @returns {Internal.RecipeComponent} Component that represents all possible Contextual Conditions
         */
        getAny: () => {
            throw new Error("Not implemented");
        },

        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeKey} Optional key that represents all possible Contextual Conditions
         */
        getKey: (Component, Builder) => {
            return LycheeSchemaFunctionality.ContextualConditions.getAny(Component, Builder).key("contextual").defaultOptional();
        }
    },
    ForgeConditions: {
        /**
         * @description If the current modloader is Forge, should return and not error; otherwise, will error
         * @returns {Internal.RecipeComponent} Component that represents all possible Forge Conditions
         */
        getAny: () => {
            throw new Error("Not implemented");
        },

        /**
         * @description If the current modloader is Forge, should return and not error; otherwise, will error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeKey} Optional key that represents all possible Forge Conditions
         */
        getKey: (Component, Builder) => {
            return LycheeSchemaFunctionality.ForgeConditions.getAny(Component, Builder).key("conditions").defaultOptional();
        }
    },
    FabricConditions: {
        /**
         * @description If the current modloader is Fabric, should return and not error; otherwise, will error
         * @returns {Internal.RecipeComponent} Component that represents all possible Fabric Conditions
         */
        getAny: () => {
            throw new Error("Not implemented");
        },

        /**
         * @description If the current modloader is Fabric, should return and not error; otherwise, will error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @param {Function} Builder The Convenient Builder Helper (TM)
         * @returns {Internal.RecipeKey} Optional key that represents all possible Fabric Conditions
         */
        getKey: (Component, Builder) => {
            return LycheeSchemaFunctionality.FabricConditions.getAny(Component, Builder).key("fabric:load_conditions").defaultOptional();
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
     * @param {string[]} properties All of this object's properties except for "type" (if undefined, none are considered)
     * @returns {{id: string, handler: Function}}
     */
    ComplexData: (id, validator, dataFixer, properties) => {
        throw new Error("Not implemented");
    },
    NBTComponent: {
        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @returns {Internal.RecipeComponent} Component that represents NBT
         */
        get: (Component) => {
            throw new Error("Not implemented");
        },

        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @returns {Internal.RecipeComponent} Optional key that represents a string or object NBT
         */
        getOrString: (Component) => {
            return LycheeSchemaFunctionality.NBTComponent.get(Component).or(Component("anyString"));
        },

        /**
         * @description This method should always return and not error
         * @param {Function} Component The Convenient Component Helper (TM)
         * @returns {Internal.RecipeKey} Optional key that represents NBT
         */
        getKey: (Component) => {
            return LycheeSchemaFunctionality.NBTComponent.get(Component).key("nbt").defaultOptional();
        }
    },
    Block: {
        BlockPredicate: {
            /**
             * @description This method should always return and not error
             * @param {Function} Component The Convenient Component Helper (TM)
             * @param {Function} Builder The Convenient Builder Helper (TM)
             * @returns {Internal.RecipeComponent} Component that represents a BlockPredicate
             */
            get: (Component, Builder) => {
                throw new Error("Not implemented");
            },

            /**
             * @description This method should always return and not error
             * @param {Function} Component The Convenient Component Helper (TM)
             * @param {Function} Builder The Convenient Builder Helper (TM)
             * @returns {Internal.RecipeKey} Optional key that represents a BlockPredicate
             */
            getKey: (Component, Builder) => {
                return LycheeSchemaFunctionality.Block.BlockPredicate.get(Component, Builder).key("block").defaultOptional();
            }
        },
        StatePropertiesPredicate: {
            /**
             * @description This method should always return and not error
             * @param {Function} Component The Convenient Component Helper (TM)
             * @param {Function} Builder The Convenient Builder Helper (TM)
             * @returns {Internal.RecipeComponent} Component that represents a StatePropertiesPredicate
             */
            get: (Component, Builder) => {
                throw new Error("Not implemented");
            },

            /**
             * @description This method should always return and not error
             * @param {Function} Component The Convenient Component Helper (TM)
             * @param {Function} Builder The Convenient Builder Helper (TM)
             * @returns {Internal.RecipeKey} Optional key that represents a StatePropertiesPredicate
             */
            getKey: (Component, Builder) => {
                return LycheeSchemaFunctionality.Block.StatePropertiesPredicate.get(Component, Builder).key("state").defaultOptional();
            }
        }
    },
    Bounds: {
        IntBounds: {
            /**
             * @description This method should always return and not error
             * @param {Function} Component The Convenient Component Helper (TM)
             * @param {Function} Builder The Convenient Builder Helper (TM)
             * @returns {Internal.RecipeComponent} Component that represents an IntBounds
             */
            get: (Component, Builder) => {
                throw new Error("Not implemented");
            },

            /**
             * @description This method should always return and not error
             * @param {Function} Component The Convenient Component Helper (TM)
             * @param {Function} Builder The Convenient Builder Helper (TM)
             * @returns {Internal.RecipeKey} Optional key that represents a IntBounds
             */
            getKey: (Component, Builder) => {
                return LycheeSchemaFunctionality.Bounds.IntBounds.get(Component, Builder).key("intbounds").defaultOptional();
            }
        },
        DoubleBounds: {
            /**
             * @description This method should always return and not error
             * @param {Function} Component The Convenient Component Helper (TM)
             * @param {Function} Builder The Convenient Builder Helper (TM)
             * @returns {Internal.RecipeComponent} Component that represents a DoubleBounds
             */
            get: (Component, Builder) => {
                throw new Error("Not implemented");
            },

            /**
             * @description This method should always return and not error
             * @param {Function} Component The Convenient Component Helper (TM)
             * @param {Function} Builder The Convenient Builder Helper (TM)
             * @returns {Internal.RecipeKey} Optional key that represents a DoubleBounds
             */
            getKey: (Component, Builder) => {
                return LycheeSchemaFunctionality.Bounds.DoubleBounds.get(Component, Builder).key("doublebounds").defaultOptional();
            }
        }
    }
}