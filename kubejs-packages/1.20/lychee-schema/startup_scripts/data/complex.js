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
                        throw new Error(message);
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

    /**
     * @description
     * Checks if the given object is a real class
     * 
     * Not foolproof, but should be good enough
     * for most usecases
     * 
     * (Any issues are probably from trying to
     * break the schema ahaha)
     * @param {{toString(): string}} value 
     * @returns {boolean}
     */
    ComplexData.isJavaClass = value => {
        if (typeof value !== "object" || typeof value.toString !== "function") {
            // Classes must be objects and must have the toString method
            return false;
        }

        /** @type {String} */
        let stringRepresentation = value.toString();

        // Shallow check, but should be good enough
        // Classes, when toString()'d, return a string of the format
        // class canonical.path.to.class
        if (stringRepresentation.startsWith("class ")) {
            return true;
        }

        return false;
    }

    /**
     * @description Recursively explores the given object in order to "un-recursive" it, flattening the nest into a simple array
     * @param {object[]} data Array to which to append found data
     * @param {any} currentObject The object to explore
     * @param {object[]} allComplexData Array of all possible types; will be used for validation and datafixing
     * @param {number} depth The current depth; will exit early and throw if the recursive algorithm gets too far
     * @returns {object} currentObject, or perhaps a modified version of it; it's recommended to not discard this
     */
    ComplexData.exploreObject = (data, currentObject, allComplexData, depth) => {
        // Arbitrary depth limit
        if (depth > LycheeSchemaFunctionality.MaxDepth) {
            console.SERVER.error(`Exceeded maximum depth of ${LycheeSchemaFunctionality.MaxDepth}! If you know what you're doing, you can increase it by modifying lychee/register.js. Otherwise, maybe nest less!`);
            throw new Error("Exceeded depth limit");
        }
        
        if (typeof currentObject !== "object") {
            const data = currentObject;
            currentObject = {};
            currentObject[LycheeSchemaFunctionality.Constants.Keys.TYPE] = LycheeSchemaFunctionality.Constants.InternalKeys.PRIMITIVE;
            currentObject[LycheeSchemaFunctionality.Constants.InternalKeys.DATA] = data;
        } else {
            for (const internalKey in LycheeSchemaFunctionality.Constants.InternalKeys) {
                if (internalKey in currentObject) {
                    throw new Error("Invalid internal key");
                } else if (currentObject.type === internalKey) {
                    throw new Error("Invalid internal type");
                }
            }
        }

        for (const data of allComplexData) {
            if (data.id === currentObject[LycheeSchemaFunctionality.Constants.Keys.TYPE]) {
                // Validation, datafixing, and all that jazz
                currentObject = data.handler(currentObject);
                break;
            }
        }

        const parentIndex = data.length;
        data.push(currentObject);

        for (const key in currentObject) {
            let value = currentObject[key];
            
            if (key === "class") {
                if(ComplexData.isJavaClass(value)) {
                    console.SERVER.error(`Cannot use Java objects in schema`);
                    throw new Error("Invalid object - reserved key");
                }
            }

            if (Array.isArray(value)) {
                currentObject[LycheeSchemaFunctionality.Constants.InternalKeys.ISRECURSIVE] = true;

                // Numeric loop instead of "of" operator to ensure order remains the same
                for (let idx = 0; idx < value.length; idx++) {
                    // Operate on primitives as well, and denote them accordingly
                    let objectifiedEntry = ComplexData.exploreObject(data, value[idx], allComplexData, depth + 1);

                    objectifiedEntry[LycheeSchemaFunctionality.Constants.InternalKeys.PARENT] = parentIndex;
                    objectifiedEntry[LycheeSchemaFunctionality.Constants.InternalKeys.KEY] = key;
                    objectifiedEntry[LycheeSchemaFunctionality.Constants.InternalKeys.FROMARRAY] = true;
                }

                delete currentObject[key];
            } else if (typeof value === "object") {
                // Only operate on nested objects
                let modifiedValue = ComplexData.exploreObject(data, value, allComplexData, depth + 1);
                modifiedValue[LycheeSchemaFunctionality.Constants.InternalKeys.PARENT] = parentIndex;
                modifiedValue[LycheeSchemaFunctionality.Constants.InternalKeys.KEY] = key;
                currentObject[LycheeSchemaFunctionality.Constants.InternalKeys.ISRECURSIVE] = true;

                delete currentObject[key];
            }
        }

        return currentObject;
    }

    /**
     * @description Flatten the nest represented by this object into an array
     * @param {object} value Current object
     * @param {object[]} allComplexData Array of all possible types; will be used for validation and datafixing
     */
    ComplexData.handleObject = (value, allComplexData) => {
        // Translate recursion into a simple array
        const data = [];
        value = ComplexData.exploreObject(data, value, allComplexData, 0);

        // Discard first entry, as it's the current object
        data.shift();

        // We've explored the nested data and have judged whether it makes sense to employ this tactic
        if (value[LycheeSchemaFunctionality.Constants.InternalKeys.ISRECURSIVE]) {
            value[LycheeSchemaFunctionality.Constants.InternalKeys.DATA] = data;
        }

        return value;
    }

    /**
     * 
     * @param {Internal.JsonObject} json 
     * @returns 
     */
    ComplexData.handleJSON = json => {
        // This object isn't recursive, so don't bother with anything else
        if (!json.has(LycheeSchemaFunctionality.Constants.InternalKeys.ISRECURSIVE) || !json.get(LycheeSchemaFunctionality.Constants.InternalKeys.ISRECURSIVE).getAsBoolean()) {
            return json;
        }

        const oldDataElement = json.get(LycheeSchemaFunctionality.Constants.InternalKeys.DATA);
        const isArray = oldDataElement.isJsonArray();
        const oldData = isArray ? oldDataElement.getAsJsonArray() : new LycheeSchemaFunctionality.LoadedClasses.$JsonArray();
        
        if (!isArray) {
            oldData["add(com.google.gson.JsonElement)"](oldDataElement.getAsJsonObject());
        }

        /** @type {Internal.JsonArray} */
        const data = new LycheeSchemaFunctionality.LoadedClasses.$JsonArray();
        
        // Make sure we have the current object at the beginning of this new array for easy access
        data["add(com.google.gson.JsonElement)"](json);
        data.addAll(oldData);

        for (const entry of oldData) {
            if (!entry.has(LycheeSchemaFunctionality.Constants.InternalKeys.PARENT) || !entry.has(LycheeSchemaFunctionality.Constants.InternalKeys.KEY)) {
                console.SERVER.error(`Internal error: Object ${entry} does not have required data! Report this forward, please`);
                throw new Error("Invalid object data");
            }

            let parent = data.get(entry.get(LycheeSchemaFunctionality.Constants.InternalKeys.PARENT).getAsInt());
            let key = entry.get(LycheeSchemaFunctionality.Constants.InternalKeys.KEY).getAsString();

            if (!parent.isJsonObject()) {
                console.SERVER.error(`Internal error: Parent ${parent} is not a JsonObject! Report this forward, please`);
                throw new Error("Invalid object type");
            }

            let parentJSONObject = parent.getAsJsonObject();

            let originatesFromArray = entry.has(LycheeSchemaFunctionality.Constants.InternalKeys.FROMARRAY)
            && entry.get(LycheeSchemaFunctionality.Constants.InternalKeys.FROMARRAY).getAsBoolean();

            if (originatesFromArray && !parentJSONObject.has(key)) {
                parentJSONObject.add(key, new LycheeSchemaFunctionality.LoadedClasses.$JsonArray());
            }

            entry.remove(LycheeSchemaFunctionality.Constants.InternalKeys.PARENT);
            entry.remove(LycheeSchemaFunctionality.Constants.InternalKeys.KEY);
            entry.remove(LycheeSchemaFunctionality.Constants.InternalKeys.ISRECURSIVE);
            entry.remove(LycheeSchemaFunctionality.Constants.InternalKeys.FROMARRAY);

            let isPrimitive = entry.has(LycheeSchemaFunctionality.Constants.Keys.TYPE) && entry.has(LycheeSchemaFunctionality.Constants.InternalKeys.DATA)
            && entry.get(LycheeSchemaFunctionality.Constants.Keys.TYPE).getAsString() === LycheeSchemaFunctionality.Constants.InternalKeys.PRIMITIVE;

            let entryData = isPrimitive ? entry.get(LycheeSchemaFunctionality.Constants.InternalKeys.DATA) : entry;

            if (originatesFromArray) {
                let array = parentJSONObject.get(key).getAsJsonArray();
                array["add(com.google.gson.JsonElement)"](entryData);
            } else {
                parentJSONObject.add(key, entryData);
            }
        }

        json.remove(LycheeSchemaFunctionality.Constants.InternalKeys.PARENT);
        json.remove(LycheeSchemaFunctionality.Constants.InternalKeys.ISRECURSIVE);
        json.remove(LycheeSchemaFunctionality.Constants.InternalKeys.DATA);

        return data.get(0);
    }

    /**
     * @description Build a recipe component that can accept a (practically infinitely) nested set of objects and arrays
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {object[]} allComplexData Array of all possible types; will be used for validation and datafixing
     * @param {{class: Internal.Class}[]} allowedClassConstructs Array of all allowed Java classes for this component
     * @returns {Internal.RecipeComponent} Component with the described functionality
     */
    ComplexData.handle = (Component, allComplexData, allowedClassConstructs) => {
        const anyString = Component("anyString");
        const anyInt = Component("anyIntNumber");
        const anyDouble = Component("anyDoubleNumber");
        const bool = Component("bool");

        const anyValue = bool.or(anyInt).or(anyDouble).or(anyString);

        const jsonMap = anyValue.asMap(anyString);
        const component = jsonMap.or(anyValue).asArrayOrSelf().asMap(anyString).asArrayOrSelf();

        return component.map(value => {
            if (Array.isArray(value)) {
                // If it's an array, apply nesting algorithm to each separately
                for (const index in value) {
                    value[index] = ComplexData.handleObject(value[index], allComplexData, allowedClassConstructs);
                }
            } else if (typeof value === "object") {
                // Otherwise, apply just to this object
                value = ComplexData.handleObject(value, allComplexData, allowedClassConstructs);
            }

            return value;
        }, /** @param {Internal.JsonElement} json */ json => {
            if (json.isJsonObject()) {
                return ComplexData.handleJSON(json);
            } else if (json.isJsonArray()) {
                /** @type {Internal.JsonArray} */
                let array = json.getAsJsonArray();
                let newArray = new LycheeSchemaFunctionality.LoadedClasses.$JsonArray();

                for (const element of array) {
                    newArray["add(com.google.gson.JsonElement)"](ComplexData.handleJSON(element));
                }

                return newArray;
            }

            return json;
        });
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.ComplexData = ComplexData;
    });
})();