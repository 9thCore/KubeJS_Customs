ServerEvents.recipes(event => {
    event.recipes.lychee.block_interacting(
        "minecraft:iron_pickaxe",
        "minecraft:stone",
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
});