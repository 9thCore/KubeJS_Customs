(function() {
    const Validators = {};

    /**
     * @description A validator that always passes
     * @returns {[boolean, string]}
     */
    Validators.alwaysTrue = () => [true, `This should never appear. If it does, it's a major internal error!`];

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

    /**
     * @description A validator that passes if the given value is in the passed accepted values array
     * @param {string} key 
     * @param {object} value 
     * @param {object[]} acceptedValues 
     * @returns {[boolean, string]}
     */
    Validators.oneOf = (key, value, acceptedValues) => [
        acceptedValues.includes(value),
        `Key "${key}" must be one of ${acceptedValues.join(" | ")}, but is ${value} instead`
    ];

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.Validators = Validators;
    });
})();