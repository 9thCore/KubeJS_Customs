(function() {
    /**
     * 
     * @returns {Internal.RecipeComponent[]} List of all possible Post Actions
     */
    const getAll = () => {
        const all = [];

        all.push(new LycheeSchemaFunctionality.ComplexData(
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
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.item("item", "count")
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
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
        const anyString = Component("anyString");
        const allPostActions = getAll();

        const item = Component("registryObject", {registry: "minecraft:item"});
        const count = Component("intNumber");

        const possibleValues = Builder([
            anyString.key("type"),
            item.key("item").defaultOptional(),
            count.key("count").defaultOptional()
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
                console.SERVER.error(`"${object.type}" is not a valid Post Action type. Must be one of ${LycheeSchemaFunctionality.ComplexData.listPossibleIDs(allPostActions)}`);
            } else {
                console.SERVER.error(`A Post Action must have a type, one of ${LycheeSchemaFunctionality.ComplexData.listPossibleIDs(allPostActions)}`);
            }
            
            return null;
        });

        return postAny.asArrayOrSelf();
    };

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.PostActions.getAny = getAny;
    });
})();