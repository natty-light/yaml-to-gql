export type Tree = {
  [field: string]: Leaf
}

export type Leaf = string | (string | Tree)[] | Tree


export type InputNode = {
  [input: string]: string
}

export type InputMap = {
  [input: string]: string
}

export type TriggerPropertiesLookup = {[key: string]: string}[]

// UTILITY TYPES
export type NestedKeyValuePairMap = {
  [key: string]: number | boolean | string | NestedKeyValuePairMap;
};

export type FromEmailAddress = `from <${string}>`;
