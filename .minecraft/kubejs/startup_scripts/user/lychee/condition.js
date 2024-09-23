if (Platform.getMods().containsKey("lychee")) {
    LycheeEvents.customCondition("test_custom_condition", event => {
        console.STARTUP.log(`Registering condition "test_custom_condition"`);

        event.condition.testFunc = (recipe, ctx, times) => {
            console.log("Running test function");
            console.log("Condition data: ", event.data);

            // Have about a 1/4 chance of failing every time
            if (Math.random() < 0.25) {
                return 0;
            }

            return times;
        };
        
        event.condition.testInTooltipsFunc = () => InteractionResult.FAIL;
        event.cancel();
    });
}