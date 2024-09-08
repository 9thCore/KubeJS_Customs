(function() {
    /**
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {Function} Builder The Convenient Builder Helper (TM)
     * @returns {Internal.RecipeComponent} Component that represents an IntBounds
     */
    const get = (Component, Builder) => {
        const anyInt = Component("anyIntNumber");

        const bounds = Builder([
            anyInt.key("min").defaultOptional(),
            anyInt.key("max").defaultOptional()
        ]).mapIn(object => {
            if (typeof object === "number") {
                return {
                    min: object,
                    max: object
                };
            }
            
            return object;
        });

        return bounds;
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.Bounds.IntBounds.get = get;
    });
})();