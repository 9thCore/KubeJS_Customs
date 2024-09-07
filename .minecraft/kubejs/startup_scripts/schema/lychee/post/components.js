(function() {
    let anyString = null; // Set lazily when getAny() is called
    /**
     * @description Compiles the Post Action's IDs into a human-readable string
     * @param {{id: string, post: Internal.RecipeComponent}[]} allPostActions
     * @returns {string}
     */
    const listPossibleIDs = (allPostActions) => {
        const IDs = [];
        for (let action of allPostActions) {
            IDs.push(`"${action.id}"`);
        }
        return IDs.join(" | ");
    }

    /**
     * 
     * @param {Internal.RecipeSchemaRegistryEventJS} id ID of the Post Action
     * @param {Function} validator Validator run on every component of the Post Action: first arg is key, second arg is value, return value is [passed: boolean, errorMessage: string]
     * @param {Function} dataFixer Fixer for the entire object, used for things like converting {item: "2x minecraft:stone"} to {item: "minecraft:stone", count: 2}
     * @returns {{id: string, handler: Function}}
     */
    const post = (id, validator, dataFixer) => {
        return {
            id: id,
            handler: object => {
                for (let key in object) {
                    // Skip over the "type" key
                    if (key === "type") {
                        continue;
                    }
                    let [passed, error] = validator.call(null, key, object[key]);
                    if (!passed) {
                        console.error(error);
                        return null;
                    }
                }
                dataFixer.call(null, object);
                return object;
            }
        };
    }

    /**
     * 
     * @returns {Internal.RecipeComponent[]} List of all possible Post Actions
     */
    const getAll = () => {
        const all = [];

        all.push(post(
            "drop_item",
            (key, value) => {
                switch (key) {
                    case "item":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    case "count":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "nbt":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", true);
                    default:
                        return false;
                }
            },
            LycheeSchemaFunctionality.DataFixers.item("item", "count")
        ));

        all.push(post(
            "prevent_default",
            LycheeSchemaFunctionality.Validators.alwaysTrue,
            LycheeSchemaFunctionality.DataFixers.none
        ));

        return all;
    }

    /**
     * 
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {Function} Builder The Convenient Builder Helper (TM)
     * @returns {Internal.RecipeComponent} Combination of all possible Post Actions
     */
    const getAny = (Component, Builder) => {
        anyString = Component("anyString");
        const allPostActions = getAll();

        const item = Component("registryObject", {registry: "minecraft:item"});
        const count = Component("intNumber");

        const possibleValues = Builder([
            anyString.key("type"),
            item.key("item").defaultOptional(),
            count.key("count").optional(1)
        ]);

        const postAny = possibleValues.mapIn(object => {
            if (typeof object !== "object") {
                console.SERVER.error(`A Post Action must be an object`);
                return null;
            }

            for (const post of allPostActions) {
                if (post.id === object.type) {
                    // Found Post Action, do stuff
                    return post.handler.call(null, object);
                }
            }

            if ("type" in object) {
                console.SERVER.error(`"${object.type}" is not a valid Post Action type. Must be one of ${listPossibleIDs(allPostActions)}`);
            } else {
                console.SERVER.error(`A Post Action must have a type, one of ${listPossibleIDs(allPostActions)}`);
            }
            
            return null;
        });

        return postAny.asArrayOrSelf();
    };

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.PostActions.getAny = getAny;
    });
})();