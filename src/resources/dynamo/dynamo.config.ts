export const CUSTOM_DYNAMO_CONFIG = {
    dynamodb: {
        stages: ["dev"],
        start: {
            port: 8000,
            inMemory: true,
            heapInitial: "200m",
            heapMax: "1g",
            migrate: true,
            seed: true,
            convertEmptyValues: true,
        }
    }
}