// Unfortunately, this does need to be exposed to the environment for the sake of readability
// Me when no export
const LycheePostActions = {};

(function() {
    let anyString = null; // Set lazily when getAny() is called

    /**
     * @description Compiles the Post Action's IDs into a human-readable string
     * @param {{id: string, post: Internal.RecipeComponent}[]} allPostActions
     * @returns {string[]}
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
     * @param {Internal.RecipeComponent} possibleValues All possible values of keys in the Post Action (presumably obtained through an "or" chain)
     * @param {Function} validator Validator run on every component of the Post Action: first arg is key, second arg is value, return value is [passed: boolean, errorMessage: string]
     * @param {Function} dataFixer Fixer for the entire object, used for things like converting {item: "2x minecraft:stone"} to {item: "minecraft:stone", count: 2}
     * @returns {{id: string, post: Internal.RecipeComponent}}
     */
    const post = (id, possibleValues, validator, dataFixer) => {
        return {
            id: id,
            post: possibleValues.asMap(anyString).mapIn(object => {
                if (object.type !== id) {
                    return null;
                }
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
            })
        };
    }

    /**
     * 
     * @param {Function} Component The Convenient Component Helper (TM)
     * @returns {Internal.RecipeComponent[]} List of all possible Post Actions
     */
    const getAll = Component => {
        const all = [];

        const item = Component("registryObject", {registry: "minecraft:item"});
        const count = Component("intNumber");

        all.push(post(
            "drop_item",
            count.or(item).or(anyString),
            (key, value) => {
                switch (key) {
                    case "item":
                        return LycheePostActions.Validators.type(key, value, "string", false);
                    case "count":
                        return LycheePostActions.Validators.type(key, value, "number", true);
                    case "nbt":
                        return LycheePostActions.Validators.type(key, value, "string", true);
                    default:
                        return false;
                }
            },
            LycheePostActions.DataFixers.item("item", "count")
        ));

        all.push(post(
            "prevent_default",
            anyString,
            LycheePostActions.Validators.alwaysTrue,
            LycheePostActions.DataFixers.none
        ));

        return all;
    }

    /**
     * 
     * @param {Function} Component The Convenient Component Helper (TM)
     * @returns {Internal.RecipeComponent} Combination of all possible Post Actions
     */
    const getAny = Component => {
        anyString = Component("anyString");
        const allPostActions = getAll(Component);

        const noValidPostType = Component("anyString").mapIn(object => {
            if (typeof object !== "object") {
                console.SERVER.error(`A Post Action be an object!`);
            } else if ("type" in object) {
                console.SERVER.error(`${object.type} is not a valid Post Action type. Must be one of ${listPossibleIDs(allPostActions)}`);
            } else {
                console.SERVER.error(`A Post Action must have a type, one of ${listPossibleIDs(allPostActions)}`);
            }
            return null;
        });

        let postAny = allPostActions[0].post;
        for (let i = 1; i < allPostActions.length; i++) {
            postAny = postAny.or(allPostActions[i].post);
        }
        postAny = postAny.or(noValidPostType);

        return postAny.asArrayOrSelf();
    };

    StartupEvents.init(() => {
        LycheePostActions.getAny = getAny;
    });
})();