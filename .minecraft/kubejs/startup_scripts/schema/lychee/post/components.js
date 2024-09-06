// Unfortunately, this does need to be exposed to the environment for the sake of readability
// Me when no export
const LycheePostActions = {};

(function() {
    let anyString = null; // Set lazily when getAny() is called

    /**
     * 
     * @param {Internal.RecipeSchemaRegistryEventJS} id ID of the Post Action
     * @param {Internal.RecipeComponent} possibleValues All possible values of keys in the Post Action (presumably obtained through an "or" chain)
     * @param {Function} validator Validator run on every component of the Post Action: first arg is key, second arg is value, return value is [passed: boolean, errorMessage: string]
     * @param {Function} dataFixer Fixer for the entire object, used for things like converting {item: "2x minecraft:stone"} to {item: "minecraft:stone", count: 2}
     */
    const post = (id, possibleValues, validator, dataFixer) => {
        return possibleValues.asMap(anyString).mapIn(object => {
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
        });
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
        const all = getAll(Component);

        let postAny = all[0];
        for (let i = 1; i < all.length; i++) {
            postAny = postAny.or(all[i]);
        }

        return postAny.asArrayOrSelf();
    };

    StartupEvents.init(() => {
        LycheePostActions.getAny = getAny;
    });
})();