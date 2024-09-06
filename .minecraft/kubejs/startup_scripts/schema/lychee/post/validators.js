(function() {
    const Validators = {};

    /**
     * @description A validator that always passes
     * @returns {[boolean, string]}
     */
    Validators.alwaysTrue = () => [true, ""];

    /**
     * @description A validator that passes if the given value is of the expected type
     * @param {string} key 
     * @param {object} value 
     * @param {"bigint"|"boolean"|"function"|"number"|"object"|"string"|"symbol"|"undefined"} type 
     * @returns {[boolean, string]}
     */
    Validators.type = (key, value, type, acceptUndefined) => [
        (acceptUndefined && value === undefined) || (typeof value === type),
        `Key "${key}" must be of type ${type}, but is of type ${typeof value} instead`
    ];

    StartupEvents.init(() => {
        LycheePostActions.Validators = Validators;
    });
})();