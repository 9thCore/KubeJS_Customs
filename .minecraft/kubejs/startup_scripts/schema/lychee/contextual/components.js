(function() {
    /**
     * 
     * @returns {Internal.RecipeComponent[]} List of all possible Contextual Conditions
     */
    const getAll = () => {
        const all = [];

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "weather",
            (key, value) => {
                switch (key) {
                    case "weather":
                        return LycheeSchemaFunctionality.Validators.oneOf(key, value, ["clear", "rain", "thunder"]);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none
        ));

        return all;
    }

    /**
     * 
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {Function} Builder The Convenient Builder Helper (TM)
     * @returns {Internal.RecipeComponent} Combination of all possible Contextual Conditions
     */
    const getAny = (Component, Builder) => {
        const anyString = Component("anyString");
        const allContextual = getAll();

        const boolean = Component("bool");
        const chance = Component("floatNumberRange", {min: 0.0, max: 1.0});

        const possibleValues = Builder([
            anyString.key("type"),
            anyString.key("weather").defaultOptional(),
            boolean.key("secret").defaultOptional(),
            anyString.key("description").defaultOptional()
        ]);

        const contextualAny = possibleValues.mapIn(object => {
            if (typeof object !== "object") {
                console.SERVER.error(`A Contextual Condition must be an object`);
                return null;
            }

            for (const contextual of allContextual) {
                if (contextual.id === object.type) {
                    // Found Contextual Condition, do stuff
                    return contextual.handler.call(null, object);
                }
            }

            if ("type" in object) {
                console.SERVER.error(`"${object.type}" is not a valid Contextual Condition type. Must be one of ${LycheeSchemaFunctionality.ComplexData.listPossibleIDs(allContextual)}`);
            } else {
                console.SERVER.error(`A Contextual Condition must have a type, one of ${LycheeSchemaFunctionality.ComplexData.listPossibleIDs(allContextual)}`);
            }
            
            return null;
        });

        return contextualAny.asArrayOrSelf();
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.ContextualConditions.getAny = getAny;
    });
})();