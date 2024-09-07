(function() {
    const Validators = {};

    /**
     * @description A validator that always passes
     * @returns {[boolean, string]}
     */
    Validators.alwaysTrue = () => [true, `This should never appear. If it does, it's a major internal error!`];

    /**
     * @description A validator that always fails
     * @param {string} message
     * @returns {[boolean, string]}
     */
    Validators.alwaysFalse = (message) => [false, message];

    /**
     * @description A validator that passes if the given value is of the expected type
     * @param {string} key 
     * @param {object} value 
     * @param {"bigint"|"boolean"|"function"|"number"|"object"|"string"|"symbol"|"undefined"} type 
     * @param {boolean} acceptUndefined
     * @returns {[boolean, string]}
     */
    Validators.type = (key, value, type, acceptUndefined) => [
        (acceptUndefined && value === undefined) || (typeof value === type),
        `Key ${key} must be of type ${type}, but is of type ${typeof value} instead`
    ];

    /**
     * @description A validator that passes if the given value is one of the expected types
     * @param {string} key 
     * @param {object} value 
     * @param {("bigint"|"boolean"|"function"|"number"|"object"|"string"|"symbol"|"undefined")[]} types
     * @param {boolean} acceptUndefined
     * @returns {[boolean, string]}
     */
    Validators.multiType = (key, value, types, acceptUndefined) => {
        if (acceptUndefined && value === undefined) {
            return Validators.alwaysTrue();
        }
        return Validators.oneOf(key, typeof value, types);
    };

    /**
     * @description A validator that passes if the given value is in the passed accepted values array
     * @param {string} key 
     * @param {object} value 
     * @param {object[]} acceptedValues 
     * @returns {[boolean, string]}
     */
    Validators.oneOf = (key, value, acceptedValues) => [
        acceptedValues.includes(value),
        `Key ${key} must be one of ${acceptedValues.join(" | ")}, but is ${value} instead`
    ];

    /**
     * @description A validator that checks a specified callback for every entry of an array
     * @param {string} key 
     * @param {object[]} value 
     * @param {Function} callback 
     */
    Validators.forEveryEntry = (key, value, callback) => {
        if (!Array.isArray(value)) {
            throw new Error(`Key ${key}, value ${value} is not of type array`);
        }
        for (let index in value) {
            let [passed, message] = callback.call(null, index, value[index]);
            if (!passed) {
                return [passed, message];
            }
        }
        return Validators.alwaysTrue();
    };

    /**
     * @description A validator that passes if every entry in the given array is of the expected type
     * @param {string} key 
     * @param {object[]} value 
     * @param {"bigint"|"boolean"|"function"|"number"|"object"|"string"|"symbol"|"undefined"} type 
     * @param {boolean} acceptUndefined
     * @returns {[boolean, string]}
     */
    Validators.forEveryEntryType = (key, value, type, acceptUndefined) => {
        return Validators.forEveryEntry(key, value, (i, o) => Validators.type(`${key}[${i}]`, o, type, acceptUndefined));
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.Validators = Validators;
    });
})();