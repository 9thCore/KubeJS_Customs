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
            LycheeSchemaFunctionality.DataFixers.block("block"),
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
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["number", "object"], false);
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
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["number", "object"], false);
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

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "delay",
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
            "break",
            LycheeSchemaFunctionality.Validators.alwaysTrue,
            LycheeSchemaFunctionality.DataFixers.none
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "cycle_state_property",
            (key, value) => {
                switch (key) {
                    case "block":
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "object"], false);
                    case "property":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    case "offsetX":
                    case "offsetY":
                    case "offsetZ":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["block", "property", "offsetX", "offsetY", "offsetZ"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "damage_item",
            (key, value) => {
                switch (key) {
                    case "damage":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "number", true);
                    case "target":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["damage", "target"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "set_item",
            (key, value) => {
                switch (key) {
                    case "target":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", true);
                    case "item":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    case "count":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", true);
                    case "nbt":
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "object"], true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["target", "item", "count", "nbt"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "nbt_patch",
            (key, value) => {
                switch (key) {
                    case "op":
                        return LycheeSchemaFunctionality.Validators.oneOf(key, value, ["add", "remove", "replace", "copy", "move", "test", "deep_merge"]);
                    case "path":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    case "from":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", true);
                    case "value":
                        return LycheeSchemaFunctionality.Validators.multiType(key, value, ["string", "boolean", "number"], true);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["op", "path", "from", "value"]
        ));

        all.push(new LycheeSchemaFunctionality.ComplexData(
            "custom",
            (key, value) => {
                switch (key) {
                    case "id":
                        return LycheeSchemaFunctionality.Validators.type(key, value, "string", false);
                    default:
                        return LycheeSchemaFunctionality.Validators.alwaysTrue();
                }
            },
            LycheeSchemaFunctionality.DataFixers.none,
            ["id"]
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
        const allPostActions = getAll();
        return LycheeSchemaFunctionality.ComplexData.handle(Component, allPostActions);
    };

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.PostActions.getAny = getAny;
    });
})();