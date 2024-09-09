(function() {
    /**
     * @description Helper for the shared code of conditions using other conditions
     * @param {boolean} isArray 
     * @returns {Function} Validator
     */
    const recursiveContextualValidator = (isArray) => (key, value) => {
        switch (key) {
            case "contextual":
                if (Array.isArray(value) !== isArray) {
                    return LycheeSchemaFunctionality.Validators.alwaysFalse(`Key ${key} ${isArray ? "must" : "cannot"} be an array for this ContextualCondition!`);
                }
                return LycheeSchemaFunctionality.Validators.type(key, value, "object", false);
            default:
                return LycheeSchemaFunctionality.Validators.alwaysTrue();
        }
    };

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
            LycheeSchemaFunctionality.DataFixers.none,
            ["weather"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "not",
            recursiveContextualValidator(false),
            LycheeSchemaFunctionality.DataFixers.none,
            ["contextual"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "or",
            recursiveContextualValidator(true),
            LycheeSchemaFunctionality.DataFixers.none,
            ["contextual"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "and",
            recursiveContextualValidator(true),
            LycheeSchemaFunctionality.DataFixers.none,
            ["contextual"]
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
        const anyInt = Component("anyIntNumber");
        const allContextual = getAll();

        const boolean = Component("bool");
        const chance = Component("floatNumberRange", {min: 0.0, max: 1.0});

        const possibleValues = Builder([
            anyString.key("type"),
            anyString.key("weather").defaultOptional(),
            boolean.key("secret").defaultOptional(),
            anyString.key("description").defaultOptional()
        ]);

        return LycheeSchemaFunctionality.ComplexData.prepareDataArray(Component, "ContextualCondition", type => {
            switch (type) {
                case "and":
                case "or":
                    return [{key: "contextual", isArray: true}];
                case "not":
                    return [{key: "contextual", isArray: false}];
                default:
                    return [];
            }
        }, possibleValues, allContextual);
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.ContextualConditions.getAny = getAny;
    });
})();