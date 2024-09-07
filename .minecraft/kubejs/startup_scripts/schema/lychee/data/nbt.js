(function() {
    /**
     * @param {Function} Component The Convenient Component Helper (TM)
     * @returns {Internal.RecipeComponent} Component that represents NBT
     */
    const get = Component => {
        const bool = Component("bool");
        const anyString = Component("anyString");
        const anyInt = Component("anyIntNumber");
        const anyLong = Component("anyLongNumber");
        const anyFloat = Component("anyFloatNumber");
        const anyDouble = Component("anyDoubleNumber");

        const possibleValues = anyString.or(bool).or(anyInt).or(anyLong).or(anyFloat).or(anyDouble);
        
        return possibleValues.asMap(anyString);
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.NBTComponent.get = get;
    });
})();