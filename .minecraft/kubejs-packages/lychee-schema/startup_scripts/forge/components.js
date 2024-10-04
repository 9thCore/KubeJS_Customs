(function() {
    /**
     * @description Helper for the shared code of conditions using other conditions
     * @param {boolean} isArray 
     * @returns {Function} Validator
     */
    const recursiveConditionValidator = (isArray, arrayKey) => (key, value) => {
        switch (key) {
            case arrayKey:
                if (Array.isArray(value) !== isArray) {
                    return LycheeSchemaFunctionality.Validators.alwaysFalse(`Key ${key} ${isArray ? "must" : "cannot"} be an array for this Forge condition!`);
                }
                return LycheeSchemaFunctionality.Validators.type(key, value, "object", false);
            default:
                return LycheeSchemaFunctionality.Validators.alwaysTrue();
        }
    };

    /**
     * @returns {Internal.RecipeComponent[]} List of all Forge conditions
     */
    const getAll = () => {
        const all = [];

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "forge:true",
            LycheeSchemaFunctionality.Validators.alwaysTrue,
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "forge:false",
            LycheeSchemaFunctionality.Validators.alwaysTrue,
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "forge:not",
            recursiveConditionValidator(false, "value"),
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "forge:and",
            recursiveConditionValidator(true, "values"),
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "forge:or",
            recursiveConditionValidator(true, "values"),
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "forge:mod_loaded",
            (key, value) => {
                switch(key) {
                    case "modid":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "forge:item_exists",
            (key, value) => {
                switch(key) {
                    case "item":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "forge:tag_empty",
            (key, value) => {
                switch(key) {
                    case "tag":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
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
     * @returns {Internal.RecipeComponent} Combination of all possible Forge Conditions
     */
    const getAny = (Component, Builder) => {
        const anyString = Component("anyString");
        const allConditions = getAll();

        const possibleValues = Builder([
            anyString.key("type"),
            anyString.key("modid").defaultOptional(),
            anyString.key("item").defaultOptional(),
            anyString.key("tag").defaultOptional()
        ]);

        possibleValues.add(possibleValues.key("value").defaultOptional());
        possibleValues.add(possibleValues.asArray().key("values").defaultOptional());

        const conditionAny = possibleValues.mapIn(object => {
            if (typeof object !== "object") {
                console.SERVER.error(`A Forge condition must be an object`);
                return null;
            }

            for (const condition of allConditions) {
                if (condition.id === object.type) {
                    return condition.handler.call(null, object);
                }
            }

            if ("type" in object) {
                console.SERVER.error(`"${object.type}" is not a valid Forge condition type. Must be one of ${LycheeSchemaFunctionality.ComplexData.listPossibleIDs(allConditions)}`);
            } else {
                console.SERVER.error(`A Forge condition must have a type, one of ${LycheeSchemaFunctionality.ComplexData.listPossibleIDs(allConditions)}`);
            }
            
            return null;
        });

        return conditionAny.asArray();
    };

    StartupEvents.init(() => {
        if (Platform.isForge()) {
            LycheeSchemaFunctionality.ForgeConditions.getAny = getAny;
        }
    });
})();