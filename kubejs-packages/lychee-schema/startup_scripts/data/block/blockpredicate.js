(function() {
    /**
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {Function} Builder The Convenient Builder Helper (TM)
     * @returns {Internal.RecipeComponent} Component that represents a BlockPredicate
     */
    const get = (Component, Builder) => {
        const anyString = Component("anyString");

        const predicate = Builder([
            anyString.asArray().key("blocks").defaultOptional(),
            anyString.key("tag").defaultOptional(),
            LycheeSchemaFunctionality.NBTComponent.getOrString(Component).key("nbt").defaultOptional(),
            LycheeSchemaFunctionality.Block.StatePropertiesPredicate.getKey(Component, Builder)
        ]).mapIn(object => {
            let result = LycheeSchemaFunctionality.DataFixers.blockRaw(object);
            if (result === "*") {
                // Special handling because it's expecting an object
                return {
                    blocks: [result]
                };
            }

            return result;
        }).mapOut(json => { // Because there can be the special case "*" instead of an object
            if (json.has("blocks")) {
                const array = json.get("blocks").getAsJsonArray();
                if (array.size() >= 1 && array.get(0).getAsString() === "*") {
                    return new LycheeSchemaFunctionality.LoadedClasses.$JsonPrimitive("*");
                }
            }

            return json;
        });
        
        return predicate;
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.Block.BlockPredicate.get = get;
    });
})();