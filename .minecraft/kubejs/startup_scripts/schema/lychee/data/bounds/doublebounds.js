(function() {
    /**
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {Function} Builder The Convenient Builder Helper (TM)
     * @returns {Internal.RecipeComponent} Component that represents a DoubleBounds
     */
    const get = (Component, Builder) => {
        const anyDouble = Component("anyDoubleNumber");
        const bool = Component("bool");

        const bounds = Builder([
            anyDouble.key("min").defaultOptional(),
            anyDouble.key("max").defaultOptional(),
            bool.key(LycheeSchemaFunctionality.Constants.InternalKeys.SPECIALHANDLING).defaultOptional()
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
        LycheeSchemaFunctionality.Bounds.DoubleBounds.get = get;
    });
})();