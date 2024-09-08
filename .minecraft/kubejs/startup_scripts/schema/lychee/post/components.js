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
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "object"], false);
                    case "count":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "nbt":
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "object"], true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.item("item", "count", "nbt"),
            ["item", "count", "nbt"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "prevent_default",
            LycheeSchemaFunctionality.Validators.alwaysTrue,
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "place",
            (key, value) => {
                switch (key) {
                    case "block":
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "object"], false);
                    case "offsetX":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "offsetY":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "offsetZ":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["block", "offsetX", "offsetY", "offsetZ"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "execute",
            (key, value) => {
                switch (key) {
                    case "command":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    case "hide":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "boolean", true);
                    case "repeat":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "boolean", true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["command", "hide", "repeat"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "drop_xp",
            (key, value) => {
                switch (key) {
                    case "xp":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["xp"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "random",
            (key, value) => {
                switch (key) {
                    case "rolls":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", false);
                    case "entries":
                        if (!Array.isArray(value)) {
                            return LycheeSchemaFunctionality.Validators.type(key, value, "array", false);
                        }
                        return LycheeSchemaFunctionality.Validators.forEveryEntryType(key, value, "object", false);
                    case "empty_weight":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["rolls", "entries", "empty_weight"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "if",
            (key, value) => {
                switch (key) {
                    case "then":
                    case "else":
                        if (!Array.isArray(value)) {
                            return LycheeSchemaFunctionality.Validators.type(key, value, "object", false);
                        }
                        return LycheeSchemaFunctionality.Validators.forEveryEntryType(key, value, "object", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["then", "else"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "explode",
            (key, value) => {
                switch (key) {
                    case "offsetX":
                    case "offsetY":
                    case "offsetZ":
                    case "radius":
                    case "radius_step":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "fire":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "boolean", true);
                    case "block_interaction":
                        return LycheeSchemaFunctionality.Validators.oneOf(key, value, [undefined, "keep", "destroy", "destroy_with_decay"]);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["offsetX", "offsetY", "offsetZ", "fire", "block_interaction", "radius", "radius_step"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "hurt",
            (key, value) => {
                switch (key) {
                    case "damage":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "object", false);
                    case "source":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["damage", "source"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "anvil_damage_chance",
            (key, value) => {
                switch (key) {
                    case "chance":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["chance"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "add_item_cooldown",
            (key, value) => {
                switch (key) {
                    case "s":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["s"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "move_towards_face",
            (key, value) => {
                switch (key) {
                    case "factor":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["factor"]
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
        const bool = Component("bool");
        const allPostActions = getAll();

        const item = Component("registryObject", {registry: "minecraft:item"});
        const count = Component("intNumberRange", {min: 1});
        const anyInt = Component("anyIntNumber");
        const anyDouble = Component("anyDoubleNumber");

        const possibleValues = Builder([
            anyString.key("type"),
            item.key("item").defaultOptional(),
            count.key("count").defaultOptional(),
            LycheeSchemaFunctionality.NBTComponent.getOrString(Component).key("nbt").defaultOptional(),
            LycheeSchemaFunctionality.Block.BlockPredicate.getKey(Component, Builder),
            anyInt.key("offsetX").defaultOptional(),
            anyInt.key("offsetY").defaultOptional(),
            anyInt.key("offsetZ").defaultOptional(),
            anyString.key("command").defaultOptional(),
            bool.key("hide").defaultOptional(),
            bool.key("repeat").defaultOptional(),
            count.key("xp").defaultOptional(),
            LycheeSchemaFunctionality.Bounds.IntBounds.get(Component, Builder).key("rolls").defaultOptional(),
            anyInt.key("empty_weight").defaultOptional(),
            bool.key("fire").defaultOptional(),
            anyString.key("block_interaction").defaultOptional(),
            anyDouble.key("radius").defaultOptional(),
            anyDouble.key("radius_step").defaultOptional(),
            LycheeSchemaFunctionality.Bounds.DoubleBounds.get(Component, Builder).key("damage").defaultOptional(),
            anyString.key("source").defaultOptional(),
            anyDouble.key("chance").defaultOptional(),
            anyDouble.key("s").defaultOptional(),
            anyDouble.key("factor").defaultOptional(),
            LycheeSchemaFunctionality.ContextualConditions.getKey(Component, Builder)
        ]);

        possibleValues.add(possibleValues.asArray().key("entries").defaultOptional());
        possibleValues.add(possibleValues.asArrayOrSelf().key("then").defaultOptional());
        possibleValues.add(possibleValues.asArrayOrSelf().key("else").defaultOptional());

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