(function() {
    /**
     * @constructor
     * @param {string} id ID of the object
     * @param {Function} validator Validator run on every component of the object: first arg is key, second arg is value, return value is [passed: boolean, errorMessage: string]
     * @param {Function} dataFixer Fixer for the entire object
     * @param {string[]} properties All of this object's properties except for "type" (if undefined, none are considered)
     * @returns {{id: string, handler: Function}}
     */
    function ComplexData(id, validator, dataFixer, properties) {
        this.id = id;
        this.handler = object => {
            if (typeof validator === "function" && properties !== undefined) {
                for (let key of properties) {
                    let [passed, message] = validator.call(null, key, object[key]);
                    if (!passed) {
                        console.SERVER.error(message);
                        return null;
                    }
                }
            }
            
            if (typeof dataFixer === "function") {
                try {
                    dataFixer.call(null, object);
                } catch (e) {
                    console.SERVER.error(`FATAL: Error caught during data fixing: ${e}`);
                }
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