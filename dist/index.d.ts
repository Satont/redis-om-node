import { createClient } from 'redis';

/** Defines a point on the globe using longitude and latitude. */
declare type Point = {
    /** The longitude of the point. */
    longitude: number;
    /** The latitude of the point. */
    latitude: number;
};

/**
 * Valid types for properties on an {@link Entity}.
 */
declare type EntityValue = string | number | boolean | Point | Date | any[] | null;

/**
 * A JavaScript object containing the underlying data of an {@link Entity}.
 */
declare type EntityData = Record<string, EntityValue>;

/**
 * An Entity is the class from which objects that Redis OM maps to are made. You need
 * to subclass Entity in your application:
 *
 * ```typescript
 * class Foo extends Entity {}
 * ```
 */
declare abstract class Entity {
    /** The generated entity ID. */
    readonly entityId: string;
    private schemaDef;
    private prefix;
    private entityFields;
    /**
     * Creates an new Entity.
     * @internal
     */
    constructor(schema: Schema<any>, id: string, data?: EntityData);
    /**
     * Create the fields on the Entity.
     * @internal
     */
    private createFields;
    /**
     * @returns The keyname this {@link Entity} is stored with in Redis.
     */
    get keyName(): string;
    /**
     * Converts this {@link Entity} to a JavaScript object suitable for stringification.
     * @returns a JavaScript object.
     */
    toJSON(): Record<string, any>;
    /**
     * Converts this {@link Entity} to a JavaScript object suitable for writing to RedisJSON.
     * @internal
     */
    toRedisJson(): Omit<Pick<this, {
        [K in keyof this]: this[K] extends Function ? never : K;
    }[keyof this]>, 'entityId' | 'keyName'>;
    /**
     * Loads this {@link Entity} from Redis JSON data.
     * @internal
     */
    fromRedisJson(data: RedisJsonData): undefined;
    /**
     * Converts this {@link Entity} to a JavaScript object suitable for writing to a Redis Hash.
     * @internal
     */
    toRedisHash(): RedisHashData;
    /**
     * Loads this {@link Entity} from Redis Hash data.
     * @internal
     */
    fromRedisHash(data: RedisHashData): void;
}

/**
 * A constructor that creates an {@link Entity} of type TEntity.
 * @template TEntity The {@link Entity} type.
 */
declare type EntityConstructor<TEntity> = new (schema: Schema<any>, id: string, data?: EntityData) => TEntity;

/** The type of data structure in Redis to map objects to. */
declare type DataStructure = 'HASH' | 'JSON';

/** A function that generates random {@link Entity.entityId | Entity IDs}. */
declare type IdStrategy = () => string;

/** Valid values for how to use stop words for a given {@link Schema}. */
declare type StopWordOptions = 'OFF' | 'DEFAULT' | 'CUSTOM';

/**
 * Configuration options for a {@link Schema}.
 */
declare type SchemaOptions = {
    /**
     * The string that comes before the ID when creating Redis keys for
     * {@link Entity | Entities}. Defaults to the class name of the {@link Entity}.
     * Combined with the results of idStrategy to generate a key. If prefix is `Foo`
     * and idStrategy returns `12345` then the generated key would be `Foo:12345`.
     * */
    prefix?: string;
    /**
     * The name used by RediSearch to store the index for this {@link Schema}. Defaults
     * to prefix followed by `:index`. So, for a prefix of `Foo`, it would use `Foo:index`.
     */
    indexName?: string;
    /**
     * The name used by Redis OM to store the hash of the index for this {@link Schema}.
     * Defaults to prefix followed by `:index:hash`. So, for a prefix of `Foo`, it would
     * use `Foo:index:hash`.
     */
    indexHashName?: string;
    /** The data structure used to store the {@link Entity} in Redis. Can be set
     * to either `JSON` or `HASH`. Defaults to JSON. */
    dataStructure?: DataStructure;
    /**
     * A function that generates a random {@link Entity.entityId | Entity ID}. Defaults
     * to a function that generates [ULIDs](https://github.com/ulid/spec). Combined with
     * prefix to generate a Redis key. If prefix is `Foo` and idStratgey returns `12345`
     * then the generated key would be `Foo:12345`.
     */
    idStrategy?: IdStrategy;
    /**
     * Configures the usage of stop words. Valid values are `OFF`, `DEFAULT`, and `CUSTOM`.
     * Setting this to `OFF` disables all stop words. Setting this to `DEFAULT` uses the
     * stop words intrinsic to RediSearch. Setting this to `CUSTOM` tells RediSearch to
     * use the stop words in `stopWords`.
     */
    useStopWords?: StopWordOptions;
    /**
     * Stop words to be used by this schema. If `useStopWords` is
     * anything other than `CUSTOM`, this option is ignored.
     */
    stopWords?: Array<string>;
    /**
     * Whether fields are indexed by default
     */
    indexedDefault?: boolean;
};

/**
 * Valid types a {@link FieldDefinition}.
 */
declare type SchemaFieldType = 'string' | 'number' | 'boolean' | 'text' | 'date' | 'point' | 'string[]';

/** Base interface for all fields. */
interface BaseFieldDefinition {
    /** The type of the field (i.e. string, number, boolean, etc.) */
    type: SchemaFieldType;
    /**
     * The default field name in Redis is the key name defined in the
     * {@link SchemaDefinition}. Overrides the Redis key name if set.
     */
    alias?: string;
    /**
     * Is this field indexed and thus searchable with Redis OM. Defaults
     * to the schema indexedDefault value, currently true.
     */
    indexed?: boolean;
}

/** Mixin for adding sortability to a field. */
interface SortableFieldDefinition {
    /** Enables sorting by this field. */
    sortable?: boolean;
}

/** A field representing a boolean. */
interface BooleanFieldDefinition extends BaseFieldDefinition, SortableFieldDefinition {
    /** Yep. It's a boolean. */
    type: 'boolean';
}

/** Mixin for adding caseSensitive to a TAG field. */
interface CaseSensitiveFieldDefinition {
    /**
     * Is the original case of this field indexed with Redis OM. Defaults
     * to false.
     */
    caseSensitive?: boolean;
}

/** A field representing a date/time. */
interface DateFieldDefinition extends BaseFieldDefinition, SortableFieldDefinition {
    /** Yep. It's a date. */
    type: 'date';
}

/** A field representing a number. */
interface NumberFieldDefinition extends BaseFieldDefinition, SortableFieldDefinition {
    /** Yep. It's a number. */
    type: 'number';
}

/** A field representing a point on the globe. */
interface PointFieldDefinition extends BaseFieldDefinition {
    /** Yep. It's a point. */
    type: 'point';
}

/** Mixin for adding unf to a field. */
interface NormalizedFieldDefinition {
    /**
     * Is this (sortable) field normalized when indexed. Defaults
     * to true.
     */
    normalized?: boolean;
}

/** Mixin for adding parsing for TAG fields in RediSearch. */
interface SeparableFieldDefinition {
    /**
     * Due to how RediSearch works, strings and arrays are sometimes stored the same in Redis, as a
     * simple string. This is the separator used to split those strings when it is an array. If your
     * StringField contains this separator, this can cause problems. You can change it here to avoid
     * those problems. Defaults to `|`.
     */
    separator?: string;
}

/** A field representing an array of strings. */
interface StringArrayFieldDefinition extends BaseFieldDefinition, SeparableFieldDefinition, SortableFieldDefinition, CaseSensitiveFieldDefinition, NormalizedFieldDefinition {
    /** Yep. It's a string array. */
    type: 'string[]';
}

/** A field representing a whole string. */
interface StringFieldDefinition extends BaseFieldDefinition, SeparableFieldDefinition, SortableFieldDefinition, CaseSensitiveFieldDefinition, NormalizedFieldDefinition {
    /** Yep. It's a string. */
    type: 'string';
}

/** Mixin for adding stemming to a field. */
interface StemmingFieldDefinition {
    /**
     * Is word stemming applied to this field with Redis OM. Defaults
     * to true.
     */
    stemming?: boolean;
}

/** Mixin for adding phonetic matching for TEXT fields in RediSearch. */
interface PhoneticFieldDefinition {
    /**
     * Enables setting the phonetic matcher to use, supported matchers are:
     * dm:en - Double Metaphone for English
     * dm:fr - Double Metaphone for French
     * dm:pt - Double Metaphone for Portuguese
     * dm:es - Double Metaphone for Spanish
     */
    matcher?: 'dm:en' | 'dm:fr' | 'dm:pt' | 'dm:es';
}

/** Mixin for adding weight for TEXT fields in RediSearch. */
interface WeightFieldDefinition {
    /** Enables setting the weight to apply to a text field */
    weight?: number;
}

/** A field representing searchable text. */
interface TextFieldDefinition extends BaseFieldDefinition, SortableFieldDefinition, StemmingFieldDefinition, PhoneticFieldDefinition, NormalizedFieldDefinition, WeightFieldDefinition {
    /** Yep. It's searchable text. */
    type: 'text';
}

/** Contains instructions telling how to map a property on an {@link Entity} to Redis. */
declare type FieldDefinition = StringFieldDefinition | TextFieldDefinition | NumberFieldDefinition | BooleanFieldDefinition | PointFieldDefinition | DateFieldDefinition | StringArrayFieldDefinition;

/**
* Group of {@link FieldDefinition}s that define the schema for an {@link Entity}.
 */
declare type SchemaDefinition = Record<string, FieldDefinition>;

/**
 * Defines a schema that determines how an {@link Entity} is mapped to Redis
 * data structures. Construct by passing in an {@link EntityConstructor},
 * a {@link SchemaDefinition}, and optionally {@link SchemaOptions}:
 *
 * ```typescript
 * const schema = new Schema(Foo, {
 *   aString: { type: 'string' },
 *   aNumber: { type: 'number' },
 *   aBoolean: { type: 'boolean' },
 *   someText: { type: 'text' },
 *   aPoint: { type: 'point' },
 *   aDate: { type: 'date' },
 *   someStrings: { type: 'string[]' }
 * }, {
 *   dataStructure: 'HASH'
 * });
 * ```
 *
 * A Schema is primarily used by a {@link Repository} which requires a Schema in
 * its constructor.
 *
 * @template TEntity The {@link Entity} this Schema defines.
 */
declare class Schema<TEntity extends Entity> {
    /**
     * The provided {@link EntityConstructor}.
     * @internal
     */
    readonly entityCtor: EntityConstructor<TEntity>;
    /**
     * The provided {@link SchemaDefinition}.
     * @internal
     */
    readonly definition: SchemaDefinition;
    private options?;
    /**
     * @template TEntity The {@link Entity} this Schema defines.
     * @param ctor A constructor that creates an {@link Entity} of type TEntity.
     * @param schemaDef Defines all of the fields for the Schema and how they are mapped to Redis.
     * @param options Additional options for this Schema.
     */
    constructor(ctor: EntityConstructor<TEntity>, schemaDef: SchemaDefinition, options?: SchemaOptions);
    /** The configured keyspace prefix in Redis for this Schema. */
    get prefix(): string;
    /** The configured name for the RediSearch index for this Schema. */
    get indexName(): string;
    /** The configured name for the RediSearch index hash for this Schema. */
    get indexHashName(): string;
    /**
     * The configured data structure, a string with the value of either `HASH` or `JSON`,
     * that this Schema uses to store {@link Entity | Entities} in Redis.
     * */
    get dataStructure(): DataStructure;
    /**
     * The configured usage of stop words, a string with the value of either `OFF`, `DEFAULT`,
     * or `CUSTOM`. See {@link SchemaOptions.useStopWords} and {@link SchemaOptions.stopWords}
     * for more details.
     */
    get useStopWords(): StopWordOptions;
    /**
     * The configured stop words. Ignored if {@link Schema.useStopWords} is anything other
     * than `CUSTOM`.
     */
    get stopWords(): Array<string>;
    /**
     * The configured indexed default setting for fields
     */
    get indexedDefault(): boolean;
    /** The hash value of this index. Stored in Redis under {@link Schema.indexHashName}. */
    get indexHash(): string;
    /** @internal */
    get redisSchema(): Array<string>;
    /**
     * Generates a unique string using the configured {@link IdStrategy}.
     * @returns
     */
    generateId(): string;
    private defineProperties;
    private validateOptions;
    private validateFieldDef;
}

/**
 * Abstract base class used extensively with {@link Search}.
 */
declare abstract class Where {
    /**
     * Converts this {@link Where} into a portion of a RediSearch query.
     */
    abstract toString(): string;
}

declare type Units = 'm' | 'km' | 'ft' | 'mi';
/** A function that defines a circle for `.inCircle` searches. */
declare type CircleFunction = (circle: Circle) => Circle;
/** A builder that defines a circle. */
declare class Circle {
    /** @internal */
    longitudeOfOrigin: number;
    /** @internal */
    latitudeOfOrigin: number;
    /** @internal */
    size: number;
    /** @internal */
    units: Units;
    /**
     * Sets the longitude. If not set, defaults to 0.0.
     *
     * @param value The longitude.
     * @returns This instance.
     */
    longitude(value: number): this;
    /**
     * Sets the latitude. If not set, defaults to 0.0.
     *
     * @param value The latitude.
     * @returns This instance.
     */
    latitude(value: number): this;
    /**
     * Sets the origin of the circle using a {@link Point}. If not
     * set, defaults to [Null Island](https://en.wikipedia.org/wiki/Null_Island).
     *
     * @param point A {@link Point} containing the longitude and latitude of the origin.
     * @returns This instance.
     */
    origin(point: Point): Circle;
    /**
     * Sets the origin of the circle. If not set, defaults to
     * [Null Island](https://en.wikipedia.org/wiki/Null_Island).
     *
     * @param longitude The longitude.
     * @param latitude The latitude.
     * @returns This instance.
     */
    origin(longitude: number, latitude: number): Circle;
    /**
     * Sets the radius of the {@link Circle}. Defaults to 1. If units are
     * not specified, defaults to meters.
     *
     * @param size The radius of the circle.
     * @returns This instance.
     */
    radius(size: number): this;
    /**
     * Sets the units to meters.
     * @returns This instance.
     */
    get m(): this;
    /**
     * Sets the units to meters.
     * @returns This instance.
     */
    get meter(): this;
    /**
     * Sets the units to meters.
     * @returns This instance.
     */
    get meters(): this;
    /**
     * Sets the units to kilometers.
     * @returns This instance.
     */
    get km(): this;
    /**
     * Sets the units to kilometers.
     * @returns This instance.
     */
    get kilometer(): this;
    /**
     * Sets the units to kilometers.
     * @returns This instance.
     */
    get kilometers(): this;
    /**
     * Sets the units to feet.
     * @returns This instance.
     */
    get ft(): this;
    /**
     * Sets the units to feet.
     * @returns This instance.
     */
    get foot(): this;
    /**
     * Sets the units to feet.
     * @returns This instance.
     */
    get feet(): this;
    /**
     * Sets the units to miles.
     * @returns This instance.
     */
    get mi(): this;
    /**
     * Sets the units to miles.
     * @returns This instance.
     */
    get mile(): this;
    /**
     * Sets the units to miles.
     * @returns This instance.
     */
    get miles(): this;
}

/**
 * Interface with all the methods from all the concrete
 * classes under {@link WhereField}.
 */
interface WhereField<TEntity> extends Where {
    /**
     * Adds an equals comparison to the query.
     *
     * NOTE: this function is not available for strings where full-text
     * search is enabled. In that scenario, use `.match`.
     * @param value The value to be compared
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    eq(value: string | number | boolean | Date): Search<TEntity>;
    /**
     * Adds an equals comparison to the query.
     *
     * NOTE: this function is not available for strings where full-text
     * search is enabled. In that scenario, use `.match`.
     * @param value The value to be compared
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    equal(value: string | number | boolean | Date): Search<TEntity>;
    /**
     * Adds an equals comparison to the query.
     *
     * NOTE: this function is not available for strings where full-text
     * search is enabled. In that scenario, use `.match`.
     * @param value The value to be compared
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    equals(value: string | number | boolean | Date): Search<TEntity>;
    /**
     * Adds an equals comparison to the query.
     *
     * NOTE: this function is not available for strings where full-text
     * search is enabled. In that scenario, use `.match`.
     * @param value The value to be compared
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    equalTo(value: string | number | boolean | Date): Search<TEntity>;
    /**
     * Adds a full-text search comparison to the query.
     * @param value The word or phrase sought.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    match(value: string | number | boolean): Search<TEntity>;
    /**
     * Adds a full-text search comparison to the query.
     * @param value The word or phrase sought.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    matches(value: string | number | boolean): Search<TEntity>;
    /**
     * Adds a full-text search comparison to the query that matches an exact word or phrase.
     * @param value The word or phrase sought.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    matchExact(value: string | number | boolean): Search<TEntity>;
    /**
     * Adds a full-text search comparison to the query that matches an exact word or phrase.
     * @param value The word or phrase sought.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    matchExactly(value: string | number | boolean): Search<TEntity>;
    /**
     * Adds a full-text search comparison to the query that matches an exact word or phrase.
     * @param value The word or phrase sought.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    matchesExactly(value: string | number | boolean): Search<TEntity>;
    /**
     * Makes a call to {@link WhereField.match} a {@link WhereField.matchExact} call. Calling
     * this multiple times will have no effect.
     * @returns this.
     */
    readonly exact: WhereField<TEntity>;
    /**
     * Makes a call to {@link WhereField.match} a {@link WhereField.matchExact} call. Calling
     * this multiple times will have no effect.
     * @returns this.
     */
    readonly exactly: WhereField<TEntity>;
    /**
     * Adds a boolean match with a value of `true` to the query.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    true(): Search<TEntity>;
    /**
     * Adds a boolean match with a value of `false` to the query.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    false(): Search<TEntity>;
    /**
     * Adds a greater than comparison against a field to the search query.
     * @param value The value to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    gt(value: string | number | Date): Search<TEntity>;
    /**
     * Adds a greater than comparison against a field to the search query.
     * @param value The value to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    greaterThan(value: string | number | Date): Search<TEntity>;
    /**
     * Adds a greater than or equal to comparison against a field to the search query.
     * @param value The value to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    gte(value: string | number | Date): Search<TEntity>;
    /**
     * Adds a greater than or equal to comparison against a field to the search query.
     * @param value The value to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    greaterThanOrEqualTo(value: string | number | Date): Search<TEntity>;
    /**
     * Adds a less than comparison against a field to the search query.
     * @param value The value to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    lt(value: string | number | Date): Search<TEntity>;
    /**
     * Adds a less than comparison against a field to the search query.
     * @param value The value to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    lessThan(value: string | number | Date): Search<TEntity>;
    /**
     * Adds a less than or equal to comparison against a field to the search query.
     * @param value The value to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    lte(value: string | number | Date): Search<TEntity>;
    /**
     * Adds a less than or equal to comparison against a field to the search query.
     * @param value The value to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    lessThanOrEqualTo(value: string | number | Date): Search<TEntity>;
    /**
     * Adds an inclusive range comparison against a field to the search query.
     * @param lower The lower bound of the range.
     * @param upper The upper bound of the range.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    between(lower: string | number | Date, upper: string | number | Date): Search<TEntity>;
    /**
     * Adds a whole-string match for a value within a string array to the search query.
     * @param value The string to be matched.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    contain(value: string): Search<TEntity>;
    /**
     * Adds a whole-string match for a value within a string array to the search query.
     * @param value The string to be matched.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    contains(value: string): Search<TEntity>;
    /**
     * Adds a whole-string match against a string array to the query. If any of the provided
     * strings in `value` is matched in the array, this matched.
     * @param value An array of strings that you want to match one of.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    containOneOf(...value: Array<string>): Search<TEntity>;
    /**
     * Adds a whole-string match against a string array to the query. If any of the provided
     * strings in `value` is matched in the array, this matched.
     * @param value An array of strings that you want to match one of.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    containsOneOf(...value: Array<string>): Search<TEntity>;
    /**
     * Adds a search for points that fall within a defined circle.
     * @param circleFn A function that returns a {@link Circle} instance defining the search area.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    inCircle(circleFn: CircleFunction): Search<TEntity>;
    /**
     * Adds a search for points that fall within a defined radius.
     * @param circleFn A function that returns a {@link Circle} instance defining the search area.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    inRadius(circleFn: CircleFunction): Search<TEntity>;
    /**
     * Add a search for an exact UTC datetime to the query.
     * @param value The datetime to match.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    on(value: string | number | Date): Search<TEntity>;
    /**
     * Add a search that matches all datetimes *before* the provided UTC datetime to the query.
     * @param value The datetime to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    before(value: string | number | Date): Search<TEntity>;
    /**
     * Add a search that matches all datetimes *after* the provided UTC datetime to the query.
     * @param value The datetime to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    after(value: string | number | Date): Search<TEntity>;
    /**
     * Add a search that matches all datetimes *on or before* the provided UTC datetime to the query.
     * @param value The datetime to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    onOrBefore(value: string | number | Date): Search<TEntity>;
    /**
     * Add a search that matches all datetimes *on or after* the provided UTC datetime to the query.
     * @param value The datetime to compare against.
     * @returns The {@link Search} that was called to create this {@link WhereField}.
     */
    onOrAfter(value: string | number | Date): Search<TEntity>;
}
/**
 * Abstract base class that all fields you want to filter
 * with extend. When you call {@link Search.where}, a
 * subclass of this is returned.
 */
declare abstract class WhereField<TEntity extends Entity> {
    private negated;
    /** @internal */
    protected search: Search<TEntity>;
    /** @internal */
    protected field: String;
    /** @internal */
    constructor(search: Search<TEntity>, field: string);
    /**
     * Returns the current instance. Syntactic sugar to make your code more fluent.
     * @returns this
     */
    get is(): this;
    /**
     * Returns the current instance. Syntactic sugar to make your code more fluent.
     * @returns this
     */
    get does(): this;
    /**
     * Negates the query on the field, cause it to match when the condition is
     * *not* met. Calling this multiple times will negate the negation.
     * @returns this
     */
    get not(): this;
    abstract toString(): string;
    /** @internal */
    protected negate(): void;
    /** @internal */
    protected buildQuery(valuePortion: string): string;
}

/**
 * A function that takes a {@link Search} and returns a {@link Search}. Used in nested queries.
 * @template TEntity The type of {@link Entity} being sought.
 */
declare type SubSearchFunction<TEntity extends Entity> = (search: Search<TEntity>) => Search<TEntity>;
/**
 * Abstract base class for {@link Search} and {@link RawSearch} that
 * contains methods to return search results.
 * @template TEntity The type of {@link Entity} being sought.
 */
declare abstract class AbstractSearch<TEntity extends Entity> {
    /** @internal */
    protected schema: Schema<TEntity>;
    /** @internal */
    protected client: Client;
    /** @internal */
    protected sort?: SortOptions;
    /** @internal */
    constructor(schema: Schema<TEntity>, client: Client);
    /** @internal */
    abstract get query(): string;
    /**
     * Applies an ascending sort to the query.
     * @param field The field to sort by.
     * @returns this
     */
    sortAscending(field: string): AbstractSearch<TEntity>;
    /**
     * Alias for {@link Search.sortDescending}.
     */
    sortDesc(field: string): AbstractSearch<TEntity>;
    /**
     * Applies a descending sort to the query.
     * @param field The field to sort by.
     * @returns this
     */
    sortDescending(field: string): AbstractSearch<TEntity>;
    /**
     * Alias for {@link Search.sortAscending}.
     */
    sortAsc(field: string): AbstractSearch<TEntity>;
    /**
       * Applies sorting for the query.
       * @param field The field to sort by.
       * @param order The order of returned {@link Entity | Entities} Defaults to `ASC` (ascending) if not specified
       * @returns this
       */
    sortBy(field: string, order?: 'ASC' | 'DESC'): AbstractSearch<TEntity>;
    /**
     * Finds the {@link Entity} with the minimal value for a field.
     * @param field The field with the minimal value.
     * @returns The {@link Entity} with the minimal value
     */
    min(field: string): Promise<TEntity | null>;
    /**
     * Finds the entity ID with the minimal value for a field.
     * @param field The field with the minimal value.
     * @returns The entity ID with the minimal value
     */
    minId(field: string): Promise<string | null>;
    /**
     * Finds the key name in Redis with the minimal value for a field.
     * @param field The field with the minimal value.
     * @returns The key name with the minimal value
     */
    minKey(field: string): Promise<string | null>;
    /**
     * Finds the {@link Entity} with the maximal value for a field.
     * @param field The field with the maximal value.
     * @returns The entity ID {@link Entity} with the maximal value
     */
    max(field: string): Promise<TEntity | null>;
    /**
     * Finds the entity ID with the maximal value for a field.
     * @param field The field with the maximal value.
     * @returns The entity ID with the maximal value
     */
    maxId(field: string): Promise<string | null>;
    /**
     * Finds the key name in Redis with the maximal value for a field.
     * @param field The field with the maximal value.
     * @returns The key name with the maximal value
     */
    maxKey(field: string): Promise<string | null>;
    /**
     * Returns the number of {@link Entity | Entities} that match this query.
     * @returns
     */
    count(): Promise<number>;
    /**
     * Returns a page of {@link Entity | Entities} that match this query.
     * @param offset The offset for where to start returning {@link Entity | Entities}.
     * @param count The number of {@link Entity | Entities} to return.
     * @returns An array of {@link Entity | Entities} matching the query.
     */
    page(offset: number, count: number): Promise<TEntity[]>;
    /**
     * Returns a page of entity IDs that match this query.
     * @param offset The offset for where to start returning entity IDs.
     * @param count The number of entity IDs to return.
     * @returns An array of strings matching the query.
     */
    pageOfIds(offset: number, count: number): Promise<string[]>;
    /**
     * Returns a page of key names in Redis that match this query.
     * @param offset The offset for where to start returning key names.
     * @param count The number of key names to return.
     * @returns An array of strings matching the query.
     */
    pageOfKeys(offset: number, count: number): Promise<string[]>;
    /**
     * Returns the first {@link Entity} that matches this query.
     */
    first(): Promise<TEntity | null>;
    /**
     * Returns the first entity ID that matches this query.
     */
    firstId(): Promise<string | null>;
    /**
     * Returns the first key name that matches this query.
     */
    firstKey(): Promise<string | null>;
    /**
     * Returns all the {@link Entity | Entities} that match this query. This method
     * makes multiple calls to Redis until all the {@link Entity | Entities} are returned.
     * You can specify the batch size by setting the `pageSize` property on the
     * options:
     *
     * ```typescript
     * const entities = await repository.search().returnAll({ pageSize: 100 });
     * ```
     *
     * @param options Options for the call.
     * @param options.pageSize Number of {@link Entity | Entities} returned per batch.
     * @returns An array of {@link Entity | Entities} matching the query.
     */
    all(options?: {
        pageSize: number;
    }): Promise<TEntity[]>;
    /**
     * Returns all the entity IDs that match this query. This method
     * makes multiple calls to Redis until all the entity IDs are returned.
     * You can specify the batch size by setting the `pageSize` property on the
     * options:
     *
     * ```typescript
     * const keys = await repository.search().returnAllIds({ pageSize: 100 });
     * ```
     *
     * @param options Options for the call.
     * @param options.pageSize Number of entity IDs returned per batch.
     * @returns An array of entity IDs matching the query.
     */
    allIds(options?: {
        pageSize: number;
    }): Promise<string[]>;
    /**
     * Returns all the key names in Redis that match this query. This method
     * makes multiple calls to Redis until all the key names are returned.
     * You can specify the batch size by setting the `pageSize` property on the
     * options:
     *
     * ```typescript
     * const keys = await repository.search().returnAllKeys({ pageSize: 100 });
     * ```
     *
     * @param options Options for the call.
     * @param options.pageSize Number of key names returned per batch.
     * @returns An array of key names matching the query.
     */
    allKeys(options?: {
        pageSize: number;
    }): Promise<string[]>;
    /**
     * Returns the current instance. Syntactic sugar to make your code more fluent.
     * @returns this
     */
    get return(): AbstractSearch<TEntity>;
    /**
     * Alias for {@link Search.min}.
     */
    returnMin(field: string): Promise<TEntity | null>;
    /**
     * Alias for {@link Search.minId}.
     */
    returnMinId(field: string): Promise<string | null>;
    /**
     * Alias for {@link Search.minKey}.
     */
    returnMinKey(field: string): Promise<string | null>;
    /**
     * Alias for {@link Search.max}.
     */
    returnMax(field: string): Promise<TEntity | null>;
    /**
     * Alias for {@link Search.maxId}.
     */
    returnMaxId(field: string): Promise<string | null>;
    /**
     * Alias for {@link Search.maxKey}.
     */
    returnMaxKey(field: string): Promise<string | null>;
    /**
     * Alias for {@link Search.count}.
     */
    returnCount(): Promise<number>;
    /**
     * Alias for {@link Search.page}.
     */
    returnPage(offset: number, count: number): Promise<TEntity[]>;
    /**
     * Alias for {@link Search.pageOfIds}.
     */
    returnPageOfIds(offset: number, count: number): Promise<string[]>;
    /**
     * Alias for {@link Search.pageOrKeys}.
     */
    returnPageOfKeys(offset: number, count: number): Promise<string[]>;
    /**
     * Alias for {@link Search.first}.
     */
    returnFirst(): Promise<TEntity | null>;
    /**
     * Alias for {@link Search.firstId}.
     */
    returnFirstId(): Promise<string | null>;
    /**
     * Alias for {@link Search.firstKey}.
     */
    returnFirstKey(): Promise<string | null>;
    /**
     * Alias for {@link Search.all}.
     */
    returnAll(options?: {
        pageSize: number;
    }): Promise<TEntity[]>;
    /**
     * Alias for {@link Search.allIds}.
     */
    returnAllIds(options?: {
        pageSize: number;
    }): Promise<string[]>;
    /**
     * Alias for {@link Search.allKeys}.
     */
    returnAllKeys(options?: {
        pageSize: number;
    }): Promise<string[]>;
    private callSearch;
    private keysToEntityIds;
    private keyToEntityId;
}
/**
 * Entry point to raw search which allows using raw RediSearch queries
 * against Redis OM. Requires that RediSearch (and optionally RedisJSON) be
 * installed.
 * @template TEntity The type of {@link Entity} being sought.
 */
declare class RawSearch<TEntity extends Entity> extends AbstractSearch<TEntity> {
    private rawQuery;
    /** @internal */
    constructor(schema: Schema<TEntity>, client: Client, query?: string);
    /** @internal */
    get query(): string;
}
/**
 * Entry point to fluent search. This is the default Redis OM experience.
 * Requires that RediSearch (and optionally RedisJSON) be installed.
 * @template TEntity The type of {@link Entity} being sought.
 */
declare class Search<TEntity extends Entity> extends AbstractSearch<TEntity> {
    private rootWhere?;
    /** @internal */
    get query(): string;
    /**
     * Sets up a query matching a particular field. If there are multiple calls
     * to {@link Search.where}, they are treated logically as AND.
     * @param field The field to filter on.
     * @returns A subclass of {@link WhereField} matching the type of the field.
     */
    where(field: string): WhereField<TEntity>;
    /**
     * Sets up a nested search. If there are multiple calls to {@link Search.where},
     * they are treated logically as AND.
     * @param subSearchFn A function that takes a {@link Search} and returns another {@link Search}.
     * @returns `this`.
     */
    where(subSearchFn: SubSearchFunction<TEntity>): Search<TEntity>;
    /**
     * Sets up a query matching a particular field as a logical AND.
     * @param field The field to filter on.
     * @returns A subclass of {@link WhereField} matching the type of the field.
     */
    and(field: string): WhereField<TEntity>;
    /**
     * Sets up a nested search as a logical AND.
     * @param subSearchFn A function that takes a {@link Search} and returns another {@link Search}.
     * @returns `this`.
     */
    and(subSearchFn: SubSearchFunction<TEntity>): Search<TEntity>;
    /**
     * Sets up a query matching a particular field as a logical OR.
     * @param field The field to filter on.
     * @returns A subclass of {@link WhereField} matching the type of the field.
     */
    or(field: string): WhereField<TEntity>;
    /**
     * Sets up a nested search as a logical OR.
     * @param subSearchFn A function that takes a {@link Search} and returns another {@link Search}.
     * @returns `this`.
     */
    or(subSearchFn: SubSearchFunction<TEntity>): Search<TEntity>;
    private anyWhere;
    private anyWhereForField;
    private anyWhereForFunction;
    private createWhere;
}

/**
 * A repository is the main interaction point for reading, writing, and
 * removing {@link Entity | Entities} from Redis. Create one by calling
 * {@link Client.fetchRepository} and passing in a {@link Schema}. Then
 * use the {@link Repository.fetch}, {@link Repository.save}, and
 * {@link Repository.remove} methods to manage your data:
 *
 * ```typescript
 * const repository = client.fetchRepository<Foo>(schema);
 *
 * const foo = await repository.fetch('01FK6TCJBDK41RJ766A4SBWDJ9');
 * foo.aString = 'bar';
 * foo.aBoolean = false;
 * await repository.save(foo);
 * ```
 *
 * Be sure to use the repository to create a new instance of an
 * {@link Entity} you want to create before you save it:

 * ```typescript
 * const foo = await repository.createEntity();
 * foo.aString = 'bar';
 * foo.aBoolean = false;
 * await repository.save(foo);
 * ```
 *
 * If you want to the {@link Repository.search} method, you need to create an index
 * first, and you need RediSearch or RedisJSON installed on your instance of Redis:
 *
 * ```typescript
 * await repository.createIndex();
 * const entities = await repository.search()
 *   .where('aString').eq('bar')
 *   .and('aBoolean').is.false().returnAll();
 * ```
 *
 * @template TEntity The type of {@link Entity} that this repository manages.
 */
declare type Values<T> = Omit<Pick<T, {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T]>, 'entityId' | 'keyName'>;
declare abstract class Repository<TEntity extends Entity> {
    protected client: Client;
    protected schema: Schema<TEntity>;
    /** @internal */
    constructor(schema: Schema<TEntity>, client: Client);
    /**
     * Creates an index in Redis for use by the {@link Repository.search} method. Requires
     * that RediSearch or RedisJSON is installed on your instance of Redis.
     */
    createIndex(): Promise<void>;
    /**
     * Removes an existing index from Redis. Use this method if you want to swap out your index
     * because your {@link Entity} has changed. Requires that RediSearch or RedisJSON is installed
     * on your instance of Redis.
     */
    dropIndex(): Promise<void>;
    /**
     * Creates an {@link Entity} with a populated {@link Entity.entityId} property.
     * @param data Optional values with which to initialize the entity.
     * @returns A newly created Entity.
     */
    createEntity(data: Values<TEntity>, entityId?: string): TEntity;
    /**
     * Save the {@link Entity} to Redis. If it already exists, it will be updated. If it doesn't
     * exist, it will be created.
     * @param entity The Entity to save.
     * @returns The ID of the Entity just saved.
     */
    save(entity: TEntity): Promise<string>;
    /**
     * Creates and saves an {@link Entity}. Equivalent of calling
     * {@link Repository.createEntity} followed by {@link Repository.save}.
     * @param data Optional values with which to initialize the entity.
     * @returns The newly created and saved Entity.
     */
    createAndSave(data: Values<TEntity>, entityId?: string): Promise<TEntity>;
    /**
     * Read and return an {@link Entity} from Redis with the given id. If
     * the {@link Entity} is not found, returns an {@link Entity} with all
     * properties set to `null`.
     * @param id The ID of the {@link Entity} you seek.
     * @returns The matching Entity.
     */
    fetch(id: string): Promise<TEntity>;
    /**
     * Read and return the {@link Entity | Entities} from Redis with the given IDs. If
     * a particular {@link Entity} is not found, returns an {@link Entity} with all
     * properties set to `null`.
     * @param ids The IDs of the {@link Entity | Entities} you seek.
     * @returns The matching Entities.
     */
    fetch(...ids: string[]): Promise<TEntity[]>;
    /**
     * Read and return the {@link Entity | Entities} from Redis with the given IDs. If
     * a particular {@link Entity} is not found, returns an {@link Entity} with all
     * properties set to `null`.
     * @param ids The IDs of the {@link Entity | Entities} you seek.
     * @returns The matching Entities.
     */
    fetch(ids: string[]): Promise<TEntity[]>;
    /**
     * Remove an {@link Entity} from Redis with the given id. If the {@link Entity} is
     * not found, does nothing.
     * @param id The ID of the {@link Entity} you wish to delete.
     */
    remove(id: string): Promise<void>;
    /**
     * Remove the {@link Entity | Entities} from Redis with the given ids. If a
     * particular {@link Entity} is not found, does nothing.
     * @param ids The IDs of the {@link Entity | Entities} you wish to delete.
     */
    remove(...ids: string[]): Promise<void>;
    /**
     * Remove the {@link Entity | Entities} from Redis with the given ids. If a
     * particular {@link Entity} is not found, does nothing.
     * @param ids The IDs of the {@link Entity | Entities} you wish to delete.
     */
    remove(ids: string[]): Promise<void>;
    /**
     * Set the time to live of the {@link Entity}. If the {@link Entity} is not
     * found, does nothing.
     * @param id The ID of the {@link Entity} to set and expiration for.
     * @param ttlInSeconds The time to live in seconds.
     */
    expire(id: string, ttlInSeconds: number): Promise<void>;
    /**
     * Kicks off the process of building a query. Requires that RediSearch (and optionally
     * RedisJSON) be is installed on your instance of Redis.
     * @template TEntity The type of {@link Entity} sought.
     * @returns A {@link Search} object.
     */
    search(): Search<TEntity>;
    /**
     * Creates a search that bypassed Redis OM and instead allows you to execute a raw
     * RediSearch query. Requires that RediSearch (and optionally RedisJSON) be installed
     * on your instance of Redis.
     * @template TEntity The type of {@link Entity} sought.
     * @query The raw RediSearch query you want to rune.
     * @returns A {@link RawSearch} object.
     */
    searchRaw(query: string): RawSearch<TEntity>;
    /** @internal */
    protected abstract writeEntity(entity: TEntity): Promise<void>;
    /** @internal */
    protected abstract readEntities(ids: string[]): Promise<TEntity[]>;
    /** @internal */
    protected makeKeys(ids: string[]): string[];
    /** @internal */
    protected makeKey(id: string): string;
}

declare type RedisConnection = ReturnType<typeof createClient>;
/**
 * Alias for a JavaScript object used by HSET.
 * @internal
 */
declare type RedisHashData = {
    [key: string]: string;
};
/**
 * Alias for any old JavaScript object used by JSON.SET.
 * @internal
 */
declare type RedisJsonData = {
    [key: string]: any;
};
/** The type of data structure in Redis to map objects to. */
declare type SearchDataStructure = 'HASH' | 'JSON';
/** @internal */
declare type CreateIndexOptions = {
    indexName: string;
    dataStructure: SearchDataStructure;
    schema: Array<string>;
    prefix: string;
    stopWords?: Array<string>;
};
/** @internal */
declare type LimitOptions = {
    offset: number;
    count: number;
};
/** @internal */
declare type SortOptions = {
    field: string;
    order: 'ASC' | 'DESC';
};
/** @internal */
declare type SearchOptions = {
    indexName: string;
    query: string;
    limit?: LimitOptions;
    sort?: SortOptions;
    keysOnly?: boolean;
};
/**
 * A Client is the starting point for working with Redis OM. Clients manage the
 * connection to Redis and provide limited functionality for executing Redis commands.
 * Create a client and open it before you use it:
 *
 * ```typescript
 * const client = new Client();
 * await client.open();
 * ```
 *
 * A Client is primarily used by a {@link Repository} which requires a client in
 * its constructor.
 */
declare class Client {
    /** @internal */
    protected redis?: RedisConnection;
    /**
     * Attaches an existing Node Redis connection to this Redis OM client. Closes
     * any existing connection.
     * @param connection An existing Node Redis client.
     * @returns This {@link Client} instance.
     */
    use(connection: RedisConnection): Promise<Client>;
    /**
     * Open a connection to Redis at the provided URL.
     * @param url A URL to Redis as defined with the [IANA](https://www.iana.org/assignments/uri-schemes/prov/redis).
     * @returns This {@link Client} instance.
     */
    open(url?: string): Promise<Client>;
    /**
     * Execute an arbitrary Redis command.
     * @template TResult Expect result type such as `string`, `Array<string>`, or whatever complex type Redis returns.
     * @param command The command to execute.
     * @returns The raw results of calling the Redis command.
     */
    execute(command: Array<string | number | boolean>): Promise<unknown>;
    /**
     * Creates a repository for the given schema.
     * @template TEntity The entity type for this {@link Schema} and {@link Repository}.
     * @param schema The schema.
     * @returns A repository for the provided schema.
     */
    fetchRepository<TEntity extends Entity>(schema: Schema<TEntity>): Repository<TEntity>;
    /**
     * Close the connection to Redis.
     */
    close(): Promise<void>;
    /** @internal */
    createIndex(options: CreateIndexOptions): Promise<void>;
    /** @internal */
    dropIndex(indexName: string): Promise<void>;
    /** @internal */
    search(options: SearchOptions): Promise<any[]>;
    /** @internal */
    unlink(...keys: string[]): Promise<void>;
    /** @internal */
    expire(key: string, ttl: number): Promise<void>;
    /** @internal */
    get(key: string): Promise<string | null>;
    /** @internal */
    set(key: string, value: string): Promise<void>;
    /** @internal */
    hgetall(key: string): Promise<RedisHashData>;
    /** @internal */
    hsetall(key: string, data: RedisHashData): Promise<void>;
    /** @internal */
    jsonget(key: string): Promise<RedisJsonData>;
    /** @internal */
    jsonset(key: string, data: RedisJsonData): Promise<void>;
    /**
     * @returns Whether a connection is already open.
     */
    isOpen(): boolean;
    private validateRedisOpen;
}

declare class RedisError extends Error {
    constructor(message: string);
}

export { AbstractSearch, BaseFieldDefinition, BooleanFieldDefinition, CaseSensitiveFieldDefinition, Circle, CircleFunction, Client, DataStructure, DateFieldDefinition, Entity, EntityConstructor, EntityData, EntityValue, FieldDefinition, IdStrategy, NormalizedFieldDefinition, NumberFieldDefinition, PhoneticFieldDefinition, Point, PointFieldDefinition, RawSearch, RedisError, RedisHashData, RedisJsonData, Repository, Schema, SchemaDefinition, SchemaFieldType, SchemaOptions, Search, SearchDataStructure, SeparableFieldDefinition, SortableFieldDefinition, StemmingFieldDefinition, StopWordOptions, StringArrayFieldDefinition, StringFieldDefinition, SubSearchFunction, TextFieldDefinition, WeightFieldDefinition, Where, WhereField };
