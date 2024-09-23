LycheeEvents.customAction('test_action', event => {
    // use ProbeJS for more information about the parameters
    event.action.applyFunc = (recipe, ctx, times) => {
        console.log("Current data: ", event.data);
        console.SERVER.log("boo");
        console.log("Types in array:");
        let array = event.data.complexObjectType.array;
        for (let entry of array) {
            console.log(entry, "v type v", typeof entry, "-------");
        }
        console.log("Adding 2 to \"3.8\" ", event.data.complexObjectType.array[2] + 2);
        console.log("Inverting \"false\"", !event.data.complexObjectType.array[3]);
        console.log("Inverting false (second)", !event.data.complexObjectType.array[4]);
    }

    // it is recommended to cancel the event to prevent the action from being modified by other codes
    event.cancel()
})