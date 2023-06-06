import * as _ from "lodash";

export class AttributeRemover {
    // Define a method to remove specified attributes from an object
    removeAttributes<T extends object>(object: T, attributes: Array<keyof T>): Partial<T> {
        // Use lodash's omit method to create a new object which is a copy of the original
        // object but without the specified attributes.
        // The attributes array is cast to string[] because lodash's omit method expects an array of string keys.
        return _.omit(object, attributes as string[]);
    }
}