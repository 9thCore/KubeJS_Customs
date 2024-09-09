(function() {
    const KEY_TYPE = "type";
    const INTERNALKEY_PARENT = "__parent";
    const INTERNALKEY_KEY = "__key";
    const INTERNALKEY_ISRECURSIVE = "__isrecursive";
    const INTERNALKEY_DATA = "__data";

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
     * 
     * @param {Internal.RecipeComponent[]} data 
     * @param {string} dataTypeName 
     * @param {Function} recursiveKeysGetter Getter of all keys that should be considered recursive; expected input: string, expected output: {key: string, isArray: boolean}[]
     * @param {{id: string, handler: Function}[]} allComplexData 
     * @param {object} object
     * @param {number} depth 
     * @returns {Internal.MappingRecipeComponent}
     */
    ComplexData.recursiveExploration = (data, dataTypeName, recursiveKeysGetter, allComplexData, object, depth) => {
        // Arbitrary depth limit
        if (depth > LycheeSchemaFunctionality.MaxDepth) {
            console.SERVER.error(`Exceeded maximum depth of ${LycheeSchemaFunctionality.MaxDepth}! If you know what you're doing, you can increase it by modifying lychee/register.js. Otherwise, maybe nest less!`);
            throw new Error("Exceeded depth limit");
        }

        if (typeof object !== "object") {
            console.SERVER.error(`A ${dataTypeName} must be an object`);
            throw new Error("Invalid type");
        }

        let dataIndex = -1;
        for (let index in allComplexData) {
            if (allComplexData[index].id === object[KEY_TYPE]) {
                dataIndex = index;
                break;
            }
        }

        if (dataIndex < 0) {
            if (KEY_TYPE in object) {
                console.SERVER.error(`"${object[KEY_TYPE]}" is not a valid ${dataTypeName} type. Must be one of ${ComplexData.listPossibleIDs(allComplexData)}`);
            } else {
                console.SERVER.error(`A ${dataTypeName} must have a type, one of ${ComplexData.listPossibleIDs(allComplexData)}`);
            }
            throw new Error("Could not find matching data");
        }

        const parentIndex = data.length;
        data.push(object);

        for (let {key, isArray} of recursiveKeysGetter(object[KEY_TYPE])) {
            if (key in object) {
                let value = object[key];
                if (Array.isArray(value)) {
                    for (let entry of value) {
                        let o = ComplexData.recursiveExploration(data, dataTypeName, recursiveKeysGetter, allComplexData, entry, depth + 1);
                        o[INTERNALKEY_PARENT] = parentIndex;
                        o[INTERNALKEY_KEY] = key;
                    }
                } else {
                    let o = ComplexData.recursiveExploration(data, dataTypeName, recursiveKeysGetter, allComplexData, value, depth + 1);
                    o[INTERNALKEY_PARENT] = parentIndex;
                    o[INTERNALKEY_KEY] = key;
                }

                object[INTERNALKEY_ISRECURSIVE] = true;
            }
            object[key] = isArray ? [] : {};
        }

        return allComplexData[dataIndex].handler.call(null, object);
    }

    /**
     * @description Can't use recursive RecipeComponents so the next best solution is storing them in a big array
     * - Each data will have the key "__parent"
     * - __parent is set to the index of the object's parent in the generated array
     * - in mapOut, the format will be reconstructed based on the indices
     * @param {Function} Component The Convenient Component Helper (TM)
     * @param {string} dataTypeName Name of the current data type
     * @param {Function} recursiveKeysGetter Getter of all keys that should be considered recursive; expected input: string, expected output: {key: string, isArray: boolean}[]
     * @param {Internal.RecipeComponentBuilder} possibleValues All values that the data type may accept
     * @param {{id: string, handler: Function}[]} allComplexData 
     */
    ComplexData.prepareDataArray = (Component, dataTypeName, recursiveKeysGetter, possibleValues, allComplexData) => {
        const newValues = possibleValues.createCopy();

        const anyInt = Component("anyIntNumber");
        const anyString = Component("anyString");
        const bool = Component("bool");

        newValues.add(anyInt.key(INTERNALKEY_PARENT).defaultOptional());
        newValues.add(anyString.key(INTERNALKEY_KEY).defaultOptional());
        newValues.add(bool.key(INTERNALKEY_ISRECURSIVE).defaultOptional());
        newValues.add(newValues.createCopy().asArray().key(INTERNALKEY_DATA).defaultOptional());

        const recipeComponent = newValues.mapIn(object => {
            // Translate recursion into a simple array
            const data = [];
            ComplexData.recursiveExploration(data, dataTypeName, recursiveKeysGetter, allComplexData, object, 0);

            // We've explored the nested data and have judged whether it makes sense to employ this tactic
            if (object[INTERNALKEY_ISRECURSIVE]) {
                data.shift(); // Discard first entry, as it's the current object and we don't want a StackOverflow
                object[INTERNALKEY_DATA] = data;
            }

            return object;
        }).mapOut(/** @param {Internal.JsonObject} json */ json => {
            if (!json.isJsonObject()) {
                console.SERVER.error(`Internal error: ${json} is not a JsonObject! Report this forward, please`);
                throw new Error("Invalid object type");
            }

            // This object isn't recursive, so don't bother with anything else
            if (!json.has(INTERNALKEY_ISRECURSIVE) || !json.get(INTERNALKEY_ISRECURSIVE).getAsBoolean()) {
                return json;
            }

            const oldData = json.get(INTERNALKEY_DATA).getAsJsonArray();

            /** @type {Internal.JsonArray} */
            const data = new LycheeSchemaFunctionality.LoadedClasses.$JsonArray();
            
            // Make sure we have the current object at the beginning of this new array for easy access
            data["add(com.google.gson.JsonElement)"](json);
            data.addAll(oldData);

            for (const entry of oldData) {
                if (entry.has(INTERNALKEY_PARENT) && entry.has(INTERNALKEY_KEY)) {
                    let parent = data.get(entry.get(INTERNALKEY_PARENT).getAsInt());
                    let key = entry.get(INTERNALKEY_KEY).getAsString();

                    if (!parent.isJsonObject()) {
                        console.SERVER.error(`Internal error: Parent ${parent} is not a JsonObject! Report this forward, please`);
                        throw new Error("Invalid object type");
                    }

                    let parentJSONObject = parent.getAsJsonObject();
                    let [{isArray}] = recursiveKeysGetter(parentJSONObject.get(KEY_TYPE).getAsString());

                    if (isArray && !parentJSONObject.has(key)) {
                        parentJSONObject.add(key, new LycheeSchemaFunctionality.LoadedClasses.$JsonArray());
                    }

                    entry.remove(INTERNALKEY_PARENT);
                    entry.remove(INTERNALKEY_KEY);
                    entry.remove(INTERNALKEY_ISRECURSIVE);

                    if (isArray) {
                        parent.get(key).getAsJsonArray()["add(com.google.gson.JsonElement)"](entry); 
                    } else {
                        parent.add(key, entry);
                    }
                }
            }

            json.remove(INTERNALKEY_PARENT);
            json.remove(INTERNALKEY_ISRECURSIVE);
            json.remove(INTERNALKEY_DATA);

            return data.get(0);
        });

        return recipeComponent.asArrayOrSelf();
    }

    StartupEvents.init(() => {
        LycheeSchemaFunctionality.ComplexData = ComplexData;
    });
})();