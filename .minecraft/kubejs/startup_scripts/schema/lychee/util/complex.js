(function() {
    /**
     * @constructor
     * @param {string} id ID of the object
     * @param {Function} validator Validator run on every component of the object: first arg is key, second arg is value, return value is [passed: boolean, errorMessage: string]
     * @param {Function} dataFixer Fixer for the entire object
     * @returns {{id: string, handler: Function}}
     */
    function ComplexData(id, validator, dataFixer) {
        this.id = id;
        this.handler = object => {
            if (typeof validator === "function") {
                for (let key in object) {
                    // Skip over the "type" key
                    if (key === "type") {
                        continue;
                    }
                    let [passed, error] = validator.call(null, key, object[key]);
                    if (!passed) {
                        console.error(error);
                        return null;
                    }
                }
            }
            if (typeof dataFixer === "function") {
                dataFixer.call(null, object);
            }
            return object;
        };
    };

    ComplexData.prototype = Object.create(Object.prototype);

    /**
     * @description Compiles the Complex Datas' IDs into a human-readable string
     * @param {{id: string, handler: Function}[]} allComplexData
     * @returns {string}
     */
    ComplexData.listPossibleIDs = (allComplexData) => {
        const IDs = [];
        for (let action of allComplexData) {
            IDs.push(`"${action.id}"`);
        }
        return IDs.join(" | ");
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.ComplexData = ComplexData;
    });
})();