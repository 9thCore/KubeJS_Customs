(function() {
    const DataFixers = {};
    
    /**
     * @description Extract count from KubeJS-format item string, if available
     * @param {string} item Item in KubeJS format: "minecraft:stone" or "2x minecraft:stone"
     * @returns {[number, ResourceLocation, boolean]} [Item count (1 if item was in base Minecraft format), Item ID, Whether separation passed]
     */
    const separateCountAndID = item => {
        const array = item.match(/^(\d+)x (.+)$/);
        return array !== null ? [Number.parseInt(array[1]), array[2], true] : [1, item, false];
    }

    /**
     * @description Data fixer with no logic
     * @param {object} object 
     * @returns Unmodified object
     */
    DataFixers.none = object => object;

    /**
     * @description Constructor for an item data fixer
     * @param {string} itemKey 
     * @param {string} countKey 
     * @returns {Function} Data fixer focusing on items: changes KubeJS format of items ({item: "3x minecraft:stone"}) to Lychee format ({item: "minecraft:stone", count: 3})
     */
    DataFixers.item = (itemKey, countKey) => {
        return object => {
            if (!(itemKey in object)) {
                console.error(`FATAL: No Item ID provided to ${itemKey}`);
                return null;
            }

            const item = object[itemKey];
            const [count, id, pass] = separateCountAndID(item);

            if (!pass) {
                // Post Action does not need fixing
                return object;
            } else if (pass && countKey in object) {
                console.warn(`Object has both a count: ${object[countKey]} and item with count: ${item}; discarding item count`);
                object[itemKey] = id;
                return object;
            }
            
            // Fix Post Action
            object[itemKey] = id;
            object[countKey] = count;
            return object;
        };
    }

    StartupEvents.init(() => {
        LycheePostActions.DataFixers = DataFixers;
    });
})();