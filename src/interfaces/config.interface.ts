export interface DynamoConfig {
    region: string
    accessKeyId?: string
    secretAccessKey?: string
    endpoint?: string
}

export interface DynamoQueryOptions {
    index: string
    pkValue: string
    pkKey: string
    skValue?: string
    skKey?: string
    sortAscending?: boolean
}