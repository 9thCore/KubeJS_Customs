ServerEvents.recipes(event => {
    event.recipes.lychee.block_interacting(
        "minecraft:iron_pickaxe",
        "#forge:stone",
        [
            {
                type: "prevent_default"
            },
            {
                type: "drop_item",
                item: Item.of("2x minecraft:raw_iron")
                // Alternative forms of the above:
                // item: Item.of("minecraft:raw_iron", 2)
                // item: Item.of("minecraft:raw_iron"), count: 2 // This does not work (because Item.of() returns a stack with 1 item), don't combine the two systems please
                // item: "minecraft:raw_iron", count: 2
                
                // NBT is also supported!
                // item: Item.of("minecraft:stone_sword", 1, {Damage: 100})
                // item: "minecraft:stone_sword", nbt: {Damage: 100}
            },
            {
                type: "place",
                block: {
                    tag: "minecraft:campfires", // Matches first block with this tag
                    state: {
                        lit: false
                    },
                    nbt: {
                        Items: [
                            {
                                Slot: 0,
                                id: "minecraft:porkchop", // Note that strings in NBT data will be auto-wrapped in ""
                                // id: "\"minecraft:porkchop\"", // Can also wrap manually, if desired
                                Count: 1
                            }
                        ]
                        // CookingTotalTimes: "[100, 0, 0, 0]" // This does not work in object NBT, due to using a special array: [I; 0, 0, 0, 0]. Use the string form instead!
                    }
                    // Alternative form:
                    // nbt: "{Items: [{Slot: 0, id: \"minecraft:porkchop\", Count: 1}], CookingTotalTimes: [I; 100, 0, 0, 0]}" // CookingTotalTimes works here
                },
                offsetX: 0,
                offsetY: 1
                // offsetZ: 0 // Defaults to 0, no need to add!
            }
        ],
        {
            type: "or",
            contextual: [
                {
                    type: "weather",
                    weather: "thunder"
                },
                {
                    type: "weather",
                    weather: "clear"
                }
            ]
        }
    );

    event.recipes.lychee.block_interacting(
        "minecraft:stone_hoe",
        {
            blocks: ["minecraft:wheat"],
            state: {
                age: {
                    min: 1,
                    max: 3
                }
            }
        },
        [
            {
                type: "random",
                rolls: 3,
                entries: [
                    {
                        type: "execute",
                        command: "execute as @a run say HELLO HI HELLO"
                    }
                ],
                empty_weight: 8
            },
            {
                type: "if",
                then: [
                    {
                        type: "execute",
                        command: "execute as @a run say Passed!"
                    },
                    {
                        type: "explode",
                        block_interaction: "keep"
                    }
                ],
                else: {
                    type: "execute",
                    command: "execute as @a run say Did not pass!"
                },
                contextual: {
                    type: "weather",
                    weather: "clear"
                }
            }
        ]
    );
});