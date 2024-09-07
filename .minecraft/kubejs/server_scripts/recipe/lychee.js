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
                item: "minecraft:raw_iron",
                count: 2
            }
        ],
        {
            type: "weather",
            weather: "rain"
        }
    );
});