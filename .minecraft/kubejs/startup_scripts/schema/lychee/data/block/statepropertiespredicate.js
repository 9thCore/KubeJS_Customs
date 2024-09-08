(function() {
    /**
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {Function} Builder The Convenient Builder Helper (TM)
     * @returns {Internal.RecipeComponent} Component that represents a StatePropertiesPredicate
     */
    const get = (Component, Builder) => {
        const anyString = Component("anyString");
        const bool = Component("bool");
        const anyInt = Component("anyIntNumber");

        const possibleValues = bool.or(anyInt).or(anyString).or(LycheeSchemaFunctionality.Bounds.IntBounds.get(Component, Builder));
        const state = possibleValues.asMap(anyString);

        return state;
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.Block.StatePropertiesPredicate.get = get;
    });
})();