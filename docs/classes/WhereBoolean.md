[redis-om](../README.md) / WhereBoolean

# Class: WhereBoolean<TEntity\>

## Type parameters

| Name | Type |
| :------ | :------ |
| `TEntity` | extends [`Entity`](Entity.md) |

## Hierarchy

- [`WhereField`](WhereField.md)<`TEntity`\>

  ↳ **`WhereBoolean`**

  ↳↳ [`WhereHashBoolean`](WhereHashBoolean.md)

  ↳↳ [`WhereJsonBoolean`](WhereJsonBoolean.md)

## Table of contents

### Constructors

- [constructor](WhereBoolean.md#constructor)

### Properties

- [exact](WhereBoolean.md#exact)
- [exactly](WhereBoolean.md#exactly)
- [field](WhereBoolean.md#field)
- [search](WhereBoolean.md#search)
- [value](WhereBoolean.md#value)

### Accessors

- [does](WhereBoolean.md#does)
- [is](WhereBoolean.md#is)
- [not](WhereBoolean.md#not)

### Methods

- [between](WhereBoolean.md#between)
- [buildQuery](WhereBoolean.md#buildquery)
- [contain](WhereBoolean.md#contain)
- [containAllOf](WhereBoolean.md#containallof)
- [containOneOf](WhereBoolean.md#containoneof)
- [contains](WhereBoolean.md#contains)
- [containsAllOf](WhereBoolean.md#containsallof)
- [containsOneOf](WhereBoolean.md#containsoneof)
- [eq](WhereBoolean.md#eq)
- [equal](WhereBoolean.md#equal)
- [equalTo](WhereBoolean.md#equalto)
- [equals](WhereBoolean.md#equals)
- [false](WhereBoolean.md#false)
- [greaterThan](WhereBoolean.md#greaterthan)
- [greaterThanOrEqualTo](WhereBoolean.md#greaterthanorequalto)
- [gt](WhereBoolean.md#gt)
- [gte](WhereBoolean.md#gte)
- [lessThan](WhereBoolean.md#lessthan)
- [lessThanOrEqualTo](WhereBoolean.md#lessthanorequalto)
- [lt](WhereBoolean.md#lt)
- [lte](WhereBoolean.md#lte)
- [match](WhereBoolean.md#match)
- [matchExact](WhereBoolean.md#matchexact)
- [matchExactly](WhereBoolean.md#matchexactly)
- [matches](WhereBoolean.md#matches)
- [matchesExactly](WhereBoolean.md#matchesexactly)
- [negate](WhereBoolean.md#negate)
- [toString](WhereBoolean.md#tostring)
- [true](WhereBoolean.md#true)

## Constructors

### constructor

• **new WhereBoolean**<`TEntity`\>(`search`, `field`)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TEntity` | extends [`Entity`](Entity.md)<`TEntity`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `search` | [`Search`](Search.md)<`TEntity`\> |
| `field` | `string` |

#### Inherited from

[WhereField](WhereField.md).[constructor](WhereField.md#constructor)

#### Defined in

[lib/search/where-field.ts:55](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L55)

## Properties

### exact

• `Readonly` **exact**: [`WhereText`](WhereText.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[exact](WhereField.md#exact)

#### Defined in

[lib/search/where-field.ts:19](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L19)

___

### exactly

• `Readonly` **exactly**: [`WhereText`](WhereText.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[exactly](WhereField.md#exactly)

#### Defined in

[lib/search/where-field.ts:20](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L20)

___

### field

• `Protected` **field**: `String`

#### Inherited from

[WhereField](WhereField.md).[field](WhereField.md#field)

#### Defined in

[lib/search/where-field.ts:53](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L53)

___

### search

• `Protected` **search**: [`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[search](WhereField.md#search)

#### Defined in

[lib/search/where-field.ts:52](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L52)

___

### value

• `Protected` **value**: `boolean`

#### Defined in

[lib/search/where-boolean.ts:6](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-boolean.ts#L6)

## Accessors

### does

• `get` **does**(): `this`

#### Returns

`this`

#### Inherited from

WhereField.does

#### Defined in

[lib/search/where-field.ts:64](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L64)

___

### is

• `get` **is**(): `this`

#### Returns

`this`

#### Inherited from

WhereField.is

#### Defined in

[lib/search/where-field.ts:60](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L60)

___

### not

• `get` **not**(): `this`

#### Returns

`this`

#### Inherited from

WhereField.not

#### Defined in

[lib/search/where-field.ts:68](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L68)

## Methods

### between

▸ **between**(`lower`, `upper`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `lower` | `number` |
| `upper` | `number` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[between](WhereField.md#between)

#### Defined in

[lib/search/where-field.ts:37](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L37)

___

### buildQuery

▸ `Protected` **buildQuery**(`valuePortion`): `string`

#### Parameters

| Name | Type |
| :------ | :------ |
| `valuePortion` | `string` |

#### Returns

`string`

#### Inherited from

[WhereField](WhereField.md).[buildQuery](WhereField.md#buildquery)

#### Defined in

[lib/search/where-field.ts:79](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L79)

___

### contain

▸ **contain**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[contain](WhereField.md#contain)

#### Defined in

[lib/search/where-field.ts:39](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L39)

___

### containAllOf

▸ **containAllOf**(...`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `...value` | `string`[] |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[containAllOf](WhereField.md#containallof)

#### Defined in

[lib/search/where-field.ts:42](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L42)

___

### containOneOf

▸ **containOneOf**(...`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `...value` | `string`[] |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[containOneOf](WhereField.md#containoneof)

#### Defined in

[lib/search/where-field.ts:45](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L45)

___

### contains

▸ **contains**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[contains](WhereField.md#contains)

#### Defined in

[lib/search/where-field.ts:40](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L40)

___

### containsAllOf

▸ **containsAllOf**(...`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `...value` | `string`[] |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[containsAllOf](WhereField.md#containsallof)

#### Defined in

[lib/search/where-field.ts:43](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L43)

___

### containsOneOf

▸ **containsOneOf**(...`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `...value` | `string`[] |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[containsOneOf](WhereField.md#containsoneof)

#### Defined in

[lib/search/where-field.ts:46](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L46)

___

### eq

▸ **eq**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Overrides

[WhereField](WhereField.md).[eq](WhereField.md#eq)

#### Defined in

[lib/search/where-boolean.ts:8](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-boolean.ts#L8)

___

### equal

▸ **equal**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Overrides

[WhereField](WhereField.md).[equal](WhereField.md#equal)

#### Defined in

[lib/search/where-boolean.ts:13](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-boolean.ts#L13)

___

### equalTo

▸ **equalTo**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Overrides

[WhereField](WhereField.md).[equalTo](WhereField.md#equalto)

#### Defined in

[lib/search/where-boolean.ts:15](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-boolean.ts#L15)

___

### equals

▸ **equals**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `boolean` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Overrides

[WhereField](WhereField.md).[equals](WhereField.md#equals)

#### Defined in

[lib/search/where-boolean.ts:14](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-boolean.ts#L14)

___

### false

▸ **false**(): [`Search`](Search.md)<`TEntity`\>

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Overrides

[WhereField](WhereField.md).[false](WhereField.md#false)

#### Defined in

[lib/search/where-boolean.ts:18](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-boolean.ts#L18)

___

### greaterThan

▸ **greaterThan**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[greaterThan](WhereField.md#greaterthan)

#### Defined in

[lib/search/where-field.ts:26](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L26)

___

### greaterThanOrEqualTo

▸ **greaterThanOrEqualTo**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[greaterThanOrEqualTo](WhereField.md#greaterthanorequalto)

#### Defined in

[lib/search/where-field.ts:29](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L29)

___

### gt

▸ **gt**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[gt](WhereField.md#gt)

#### Defined in

[lib/search/where-field.ts:25](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L25)

___

### gte

▸ **gte**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[gte](WhereField.md#gte)

#### Defined in

[lib/search/where-field.ts:28](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L28)

___

### lessThan

▸ **lessThan**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[lessThan](WhereField.md#lessthan)

#### Defined in

[lib/search/where-field.ts:32](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L32)

___

### lessThanOrEqualTo

▸ **lessThanOrEqualTo**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[lessThanOrEqualTo](WhereField.md#lessthanorequalto)

#### Defined in

[lib/search/where-field.ts:35](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L35)

___

### lt

▸ **lt**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[lt](WhereField.md#lt)

#### Defined in

[lib/search/where-field.ts:31](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L31)

___

### lte

▸ **lte**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `number` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[lte](WhereField.md#lte)

#### Defined in

[lib/search/where-field.ts:34](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L34)

___

### match

▸ **match**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[match](WhereField.md#match)

#### Defined in

[lib/search/where-field.ts:13](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L13)

___

### matchExact

▸ **matchExact**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[matchExact](WhereField.md#matchexact)

#### Defined in

[lib/search/where-field.ts:15](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L15)

___

### matchExactly

▸ **matchExactly**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[matchExactly](WhereField.md#matchexactly)

#### Defined in

[lib/search/where-field.ts:16](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L16)

___

### matches

▸ **matches**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[matches](WhereField.md#matches)

#### Defined in

[lib/search/where-field.ts:14](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L14)

___

### matchesExactly

▸ **matchesExactly**(`value`): [`Search`](Search.md)<`TEntity`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `value` | `string` |

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Inherited from

[WhereField](WhereField.md).[matchesExactly](WhereField.md#matchesexactly)

#### Defined in

[lib/search/where-field.ts:17](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L17)

___

### negate

▸ `Protected` **negate**(): `void`

#### Returns

`void`

#### Inherited from

[WhereField](WhereField.md).[negate](WhereField.md#negate)

#### Defined in

[lib/search/where-field.ts:75](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-field.ts#L75)

___

### toString

▸ `Abstract` **toString**(): `string`

#### Returns

`string`

#### Overrides

[WhereField](WhereField.md).[toString](WhereField.md#tostring)

#### Defined in

[lib/search/where-boolean.ts:20](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-boolean.ts#L20)

___

### true

▸ **true**(): [`Search`](Search.md)<`TEntity`\>

#### Returns

[`Search`](Search.md)<`TEntity`\>

#### Overrides

[WhereField](WhereField.md).[true](WhereField.md#true)

#### Defined in

[lib/search/where-boolean.ts:17](https://github.com/redis-developer/redis-om-node/blob/d4db235/lib/search/where-boolean.ts#L17)