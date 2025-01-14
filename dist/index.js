"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  AbstractSearch: () => AbstractSearch,
  Circle: () => Circle,
  Client: () => Client,
  Entity: () => Entity,
  RawSearch: () => RawSearch,
  RedisError: () => RedisError,
  Repository: () => Repository,
  Schema: () => Schema,
  Search: () => Search,
  Where: () => Where,
  WhereField: () => WhereField
});
module.exports = __toCommonJS(lib_exports);

// lib/client.ts
var import_redis = require("redis");

// lib/search/where.ts
var Where = class {
};

// lib/search/where-and.ts
var WhereAnd = class extends Where {
  left;
  right;
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }
  toString() {
    return `( ${this.left.toString()} ${this.right.toString()} )`;
  }
};

// lib/search/where-or.ts
var WhereOr = class extends Where {
  left;
  right;
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }
  toString() {
    return `( ${this.left.toString()} | ${this.right.toString()} )`;
  }
};

// lib/search/where-field.ts
var WhereField = class {
  negated = false;
  search;
  field;
  constructor(search, field) {
    this.search = search;
    this.field = field;
  }
  get is() {
    return this;
  }
  get does() {
    return this;
  }
  get not() {
    this.negate();
    return this;
  }
  negate() {
    this.negated = !this.negated;
  }
  buildQuery(valuePortion) {
    const negationPortion = this.negated ? "-" : "";
    const fieldPortion = this.field;
    return `(${negationPortion}@${fieldPortion}:${valuePortion})`;
  }
};

// lib/search/where-string-array.ts
var WhereStringArray = class extends WhereField {
  value;
  contain(value) {
    this.value = [value];
    return this.search;
  }
  contains(value) {
    return this.contain(value);
  }
  containsOneOf(...value) {
    this.value = value;
    return this.search;
  }
  containOneOf(...value) {
    return this.containsOneOf(...value);
  }
  toString() {
    const matchPunctuation = /[,.<>{}[\]"':;!@#$%^&*()\-+=~| ]/g;
    const escapedValue = this.value.map((s) => s.replace(matchPunctuation, "\\$&")).join("|");
    return this.buildQuery(`{${escapedValue}}`);
  }
};

// lib/search/where-boolean.ts
var WhereBoolean = class extends WhereField {
  value;
  eq(value) {
    this.value = value;
    return this.search;
  }
  equal(value) {
    return this.eq(value);
  }
  equals(value) {
    return this.eq(value);
  }
  equalTo(value) {
    return this.eq(value);
  }
  true() {
    return this.eq(true);
  }
  false() {
    return this.eq(false);
  }
};
var WhereHashBoolean = class extends WhereBoolean {
  toString() {
    return this.buildQuery(`{${this.value ? "1" : "0"}}`);
  }
};
var WhereJsonBoolean = class extends WhereBoolean {
  toString() {
    return this.buildQuery(`{${this.value}}`);
  }
};

// lib/search/where-number.ts
var WhereNumber = class extends WhereField {
  lower = Number.NEGATIVE_INFINITY;
  upper = Number.POSITIVE_INFINITY;
  lowerExclusive = false;
  upperExclusive = false;
  eq(value) {
    this.lower = value;
    this.upper = value;
    return this.search;
  }
  gt(value) {
    this.lower = value;
    this.lowerExclusive = true;
    return this.search;
  }
  gte(value) {
    this.lower = value;
    return this.search;
  }
  lt(value) {
    this.upper = value;
    this.upperExclusive = true;
    return this.search;
  }
  lte(value) {
    this.upper = value;
    return this.search;
  }
  between(lower, upper) {
    this.lower = lower;
    this.upper = upper;
    return this.search;
  }
  equal(value) {
    return this.eq(value);
  }
  equals(value) {
    return this.eq(value);
  }
  equalTo(value) {
    return this.eq(value);
  }
  greaterThan(value) {
    return this.gt(value);
  }
  greaterThanOrEqualTo(value) {
    return this.gte(value);
  }
  lessThan(value) {
    return this.lt(value);
  }
  lessThanOrEqualTo(value) {
    return this.lte(value);
  }
  toString() {
    const lower = this.makeLowerString();
    const upper = this.makeUpperString();
    return this.buildQuery(`[${lower} ${upper}]`);
  }
  makeLowerString() {
    if (this.lower === Number.NEGATIVE_INFINITY)
      return "-inf";
    if (this.lowerExclusive)
      return `(${this.lower}`;
    return this.lower.toString();
  }
  makeUpperString() {
    if (this.upper === Number.POSITIVE_INFINITY)
      return "+inf";
    if (this.upperExclusive)
      return `(${this.upper}`;
    return this.upper.toString();
  }
};

// lib/search/where-point.ts
var Circle = class {
  longitudeOfOrigin = 0;
  latitudeOfOrigin = 0;
  size = 1;
  units = "m";
  longitude(value) {
    this.longitudeOfOrigin = value;
    return this;
  }
  latitude(value) {
    this.latitudeOfOrigin = value;
    return this;
  }
  origin(pointOrLongitude, latitude) {
    if (typeof pointOrLongitude === "number" && latitude !== void 0) {
      this.longitudeOfOrigin = pointOrLongitude;
      this.latitudeOfOrigin = latitude;
    } else {
      const point = pointOrLongitude;
      this.longitudeOfOrigin = point.longitude;
      this.latitudeOfOrigin = point.latitude;
    }
    return this;
  }
  radius(size) {
    this.size = size;
    return this;
  }
  get m() {
    return this.meters;
  }
  get meter() {
    return this.meters;
  }
  get meters() {
    this.units = "m";
    return this;
  }
  get km() {
    return this.kilometers;
  }
  get kilometer() {
    return this.kilometers;
  }
  get kilometers() {
    this.units = "km";
    return this;
  }
  get ft() {
    return this.feet;
  }
  get foot() {
    return this.feet;
  }
  get feet() {
    this.units = "ft";
    return this;
  }
  get mi() {
    return this.miles;
  }
  get mile() {
    return this.miles;
  }
  get miles() {
    this.units = "mi";
    return this;
  }
};
var WherePoint = class extends WhereField {
  circle = new Circle();
  inRadius(circleFn) {
    return this.inCircle(circleFn);
  }
  inCircle(circleFn) {
    this.circle = circleFn(this.circle);
    return this.search;
  }
  toString() {
    const { longitudeOfOrigin, latitudeOfOrigin, size, units } = this.circle;
    return this.buildQuery(`[${longitudeOfOrigin} ${latitudeOfOrigin} ${size} ${units}]`);
  }
};

// lib/errors.ts
var RedisError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "RedisError";
  }
};

// lib/search/where-string.ts
var WhereString = class extends WhereField {
  value;
  eq(value) {
    this.value = value.toString();
    return this.search;
  }
  equal(value) {
    return this.eq(value);
  }
  equals(value) {
    return this.eq(value);
  }
  equalTo(value) {
    return this.eq(value);
  }
  match(_) {
    return this.throwMatchExcpetion();
  }
  matches(_) {
    return this.throwMatchExcpetion();
  }
  matchExact(_) {
    return this.throwMatchExcpetion();
  }
  matchExactly(_) {
    return this.throwMatchExcpetion();
  }
  matchesExactly(_) {
    return this.throwMatchExcpetion();
  }
  get exact() {
    return this.throwMatchExcpetionReturningThis();
  }
  get exactly() {
    return this.throwMatchExcpetionReturningThis();
  }
  toString() {
    const matchPunctuation = /[,.<>{}[\]"':;!@#$%^&*()\-+=~|/\\ ]/g;
    const escapedValue = this.value.replace(matchPunctuation, "\\$&");
    return this.buildQuery(`{${escapedValue}}`);
  }
  throwMatchExcpetion() {
    throw new RedisError("Cannot perform full-text search operations like .match on field of type 'string'. If full-text search is needed on this field, change the type to 'text' in the Schema.");
  }
  throwMatchExcpetionReturningThis() {
    throw new RedisError("Cannot perform full-text search operations like .match on field of type 'string'. If full-text search is needed on this field, change the type to 'text' in the Schema.");
  }
};

// lib/search/where-text.ts
var WhereText = class extends WhereField {
  value;
  exactValue = false;
  match(value) {
    this.value = value.toString();
    return this.search;
  }
  matchExact(value) {
    this.exact.value = value.toString();
    return this.search;
  }
  matches(value) {
    return this.match(value);
  }
  matchExactly(value) {
    return this.matchExact(value);
  }
  matchesExactly(value) {
    return this.matchExact(value);
  }
  get exact() {
    this.exactValue = true;
    return this;
  }
  get exactly() {
    return this.exact;
  }
  eq(_) {
    return this.throwEqualsExcpetion();
  }
  equal(_) {
    return this.throwEqualsExcpetion();
  }
  equals(_) {
    return this.throwEqualsExcpetion();
  }
  equalTo(_) {
    return this.throwEqualsExcpetion();
  }
  toString() {
    const matchPunctuation = /[,.<>{}[\]"':;!@#$%^&()\-+=~|]/g;
    const escapedValue = this.value.replace(matchPunctuation, "\\$&");
    if (this.exactValue) {
      return this.buildQuery(`"${escapedValue}"`);
    } else {
      return this.buildQuery(`'${escapedValue}'`);
    }
  }
  throwEqualsExcpetion() {
    throw new RedisError("Cannot call .equals on a field of type 'text', either use .match to perform full-text search or change the type to 'string' in the Schema.");
  }
};

// lib/search/results-converter.ts
var SearchResultsConverter = class {
  results;
  schema;
  constructor(schema, results) {
    this.schema = schema;
    this.results = results;
  }
  get count() {
    const [count] = this.results;
    return Number.parseInt(count);
  }
  get ids() {
    return this.keys.map((key) => key.replace(/^.*:/, ""));
  }
  get keys() {
    const [_count, ...keysAndValues] = this.results;
    return keysAndValues.filter((_entry, index) => index % 2 === 0);
  }
  get values() {
    const [_count, ...keysAndValues] = this.results;
    return keysAndValues.filter((_entry, index) => index % 2 !== 0);
  }
  get entities() {
    const ids = this.ids;
    const values = this.values;
    return values.map((array, index) => this.arrayToEntity(ids[index], array));
  }
};
var HashSearchResultsConverter = class extends SearchResultsConverter {
  arrayToEntity(id, array) {
    const keys = array.filter((_entry, index) => index % 2 === 0);
    const values = array.filter((_entry, index) => index % 2 !== 0);
    const hashData = keys.reduce((object, key, index) => {
      object[key] = values[index];
      return object;
    }, {});
    const entity = new this.schema.entityCtor(this.schema, id);
    entity.fromRedisHash(hashData);
    return entity;
  }
};
var JsonSearchResultsConverter = class extends SearchResultsConverter {
  arrayToEntity(id, array) {
    const index = array.findIndex((value) => value === "$") + 1;
    const jsonString = array[index];
    const jsonData = JSON.parse(jsonString);
    const entity = new this.schema.entityCtor(this.schema, id);
    entity.fromRedisJson(jsonData);
    return entity;
  }
};

// lib/search/where-date.ts
var WhereDate = class extends WhereField {
  lower = Number.NEGATIVE_INFINITY;
  upper = Number.POSITIVE_INFINITY;
  lowerExclusive = false;
  upperExclusive = false;
  eq(value) {
    const epoch = this.coerceDateToEpoch(value);
    this.lower = epoch;
    this.upper = epoch;
    return this.search;
  }
  gt(value) {
    const epoch = this.coerceDateToEpoch(value);
    this.lower = epoch;
    this.lowerExclusive = true;
    return this.search;
  }
  gte(value) {
    this.lower = this.coerceDateToEpoch(value);
    return this.search;
  }
  lt(value) {
    this.upper = this.coerceDateToEpoch(value);
    this.upperExclusive = true;
    return this.search;
  }
  lte(value) {
    this.upper = this.coerceDateToEpoch(value);
    return this.search;
  }
  between(lower, upper) {
    this.lower = this.coerceDateToEpoch(lower);
    this.upper = this.coerceDateToEpoch(upper);
    return this.search;
  }
  equal(value) {
    return this.eq(value);
  }
  equals(value) {
    return this.eq(value);
  }
  equalTo(value) {
    return this.eq(value);
  }
  greaterThan(value) {
    return this.gt(value);
  }
  greaterThanOrEqualTo(value) {
    return this.gte(value);
  }
  lessThan(value) {
    return this.lt(value);
  }
  lessThanOrEqualTo(value) {
    return this.lte(value);
  }
  on(value) {
    return this.eq(value);
  }
  after(value) {
    return this.gt(value);
  }
  before(value) {
    return this.lt(value);
  }
  onOrAfter(value) {
    return this.gte(value);
  }
  onOrBefore(value) {
    return this.lte(value);
  }
  toString() {
    const lower = this.makeLowerString();
    const upper = this.makeUpperString();
    return this.buildQuery(`[${lower} ${upper}]`);
  }
  makeLowerString() {
    if (this.lower === Number.NEGATIVE_INFINITY)
      return "-inf";
    if (this.lowerExclusive)
      return `(${this.lower}`;
    return this.lower.toString();
  }
  makeUpperString() {
    if (this.upper === Number.POSITIVE_INFINITY)
      return "+inf";
    if (this.upperExclusive)
      return `(${this.upper}`;
    return this.upper.toString();
  }
  coerceDateToEpoch(value) {
    if (value instanceof Date)
      return value.getTime() / 1e3;
    if (typeof value === "string")
      return new Date(value).getTime() / 1e3;
    return value;
  }
};

// lib/search/search.ts
var AbstractSearch = class {
  schema;
  client;
  sort;
  constructor(schema, client) {
    this.schema = schema;
    this.client = client;
  }
  sortAscending(field) {
    return this.sortBy(field, "ASC");
  }
  sortDesc(field) {
    return this.sortDescending(field);
  }
  sortDescending(field) {
    return this.sortBy(field, "DESC");
  }
  sortAsc(field) {
    return this.sortAscending(field);
  }
  sortBy(field, order = "ASC") {
    const fieldDef = this.schema.definition[field];
    const dataStructure = this.schema.dataStructure;
    if (fieldDef === void 0) {
      const message = `'sortBy' was called on field '${field}' which is not defined in the Schema.`;
      console.error(message);
      throw new RedisError(message);
    }
    const type = fieldDef.type;
    const markedSortable = fieldDef.sortable;
    const UNSORTABLE = ["point", "string[]"];
    const JSON_SORTABLE = ["number", "text", "date"];
    const HASH_SORTABLE = ["string", "boolean", "number", "text", "date"];
    if (UNSORTABLE.includes(type)) {
      const message = `'sortBy' was called on '${type}' field '${field}' which cannot be sorted.`;
      console.error(message);
      throw new RedisError(message);
    }
    if (dataStructure === "JSON" && JSON_SORTABLE.includes(type) && !markedSortable)
      console.warn(`'sortBy' was called on field '${field}' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema.`);
    if (dataStructure === "HASH" && HASH_SORTABLE.includes(type) && !markedSortable)
      console.warn(`'sortBy' was called on field '${field}' which is not marked as sortable in the Schema. This may result is slower searches. If possible, mark the field as sortable in the Schema.`);
    this.sort = { field, order };
    return this;
  }
  async min(field) {
    return await this.sortBy(field, "ASC").first();
  }
  async minId(field) {
    const key = await this.minKey(field);
    return this.keyToEntityId(key);
  }
  async minKey(field) {
    return await this.sortBy(field, "ASC").firstKey();
  }
  async max(field) {
    return await this.sortBy(field, "DESC").first();
  }
  async maxId(field) {
    const key = await this.maxKey(field);
    return this.keyToEntityId(key);
  }
  async maxKey(field) {
    return await this.sortBy(field, "DESC").firstKey();
  }
  async count() {
    const searchResults = await this.callSearch();
    return this.schema.dataStructure === "JSON" ? new JsonSearchResultsConverter(this.schema, searchResults).count : new HashSearchResultsConverter(this.schema, searchResults).count;
  }
  async page(offset, count) {
    const searchResults = await this.callSearch({ offset, count });
    return this.schema.dataStructure === "JSON" ? new JsonSearchResultsConverter(this.schema, searchResults).entities : new HashSearchResultsConverter(this.schema, searchResults).entities;
  }
  async pageOfIds(offset, count) {
    const keys = await this.pageOfKeys(offset, count);
    return this.keysToEntityIds(keys);
  }
  async pageOfKeys(offset, count) {
    const [_count, ...keys] = await this.callSearch({ offset, count }, true);
    return keys;
  }
  async first() {
    const foundEntity = await this.page(0, 1);
    return foundEntity[0] ?? null;
  }
  async firstId() {
    const key = await this.firstKey();
    return this.keyToEntityId(key);
  }
  async firstKey() {
    const foundIds = await this.pageOfKeys(0, 1);
    return foundIds[0] ?? null;
  }
  async all(options = { pageSize: 10 }) {
    const entities = [];
    let offset = 0;
    const pageSize = options.pageSize;
    while (true) {
      const foundEntities = await this.page(offset, pageSize);
      entities.push(...foundEntities);
      if (foundEntities.length < pageSize)
        break;
      offset += pageSize;
    }
    return entities;
  }
  async allIds(options = { pageSize: 10 }) {
    const keys = await this.allKeys(options);
    return this.keysToEntityIds(keys);
  }
  async allKeys(options = { pageSize: 10 }) {
    const keys = [];
    let offset = 0;
    const pageSize = options.pageSize;
    while (true) {
      const foundKeys = await this.pageOfKeys(offset, pageSize);
      keys.push(...foundKeys);
      if (foundKeys.length < pageSize)
        break;
      offset += pageSize;
    }
    return keys;
  }
  get return() {
    return this;
  }
  async returnMin(field) {
    return await this.min(field);
  }
  async returnMinId(field) {
    return await this.minId(field);
  }
  async returnMinKey(field) {
    return await this.minKey(field);
  }
  async returnMax(field) {
    return await this.max(field);
  }
  async returnMaxId(field) {
    return await this.maxId(field);
  }
  async returnMaxKey(field) {
    return await this.maxKey(field);
  }
  async returnCount() {
    return await this.count();
  }
  async returnPage(offset, count) {
    return await this.page(offset, count);
  }
  async returnPageOfIds(offset, count) {
    return await this.pageOfIds(offset, count);
  }
  async returnPageOfKeys(offset, count) {
    return await this.pageOfKeys(offset, count);
  }
  async returnFirst() {
    return await this.first();
  }
  async returnFirstId() {
    return await this.firstId();
  }
  async returnFirstKey() {
    return await this.firstKey();
  }
  async returnAll(options = { pageSize: 10 }) {
    return await this.all(options);
  }
  async returnAllIds(options = { pageSize: 10 }) {
    return await this.allIds(options);
  }
  async returnAllKeys(options = { pageSize: 10 }) {
    return await this.allKeys(options);
  }
  async callSearch(limit = { offset: 0, count: 0 }, keysOnly = false) {
    const options = {
      indexName: this.schema.indexName,
      query: this.query,
      limit,
      keysOnly
    };
    if (this.sort !== void 0)
      options.sort = this.sort;
    let searchResults;
    try {
      searchResults = await this.client.search(options);
    } catch (error) {
      const message = error.message;
      if (message.startsWith("Syntax error")) {
        throw new RedisError(`The query to RediSearch had a syntax error: "${message}".
This is often the result of using a stop word in the query. Either change the query to not use a stop word or change the stop words in the schema definition. You can check the RediSearch source for the default stop words at: https://github.com/RediSearch/RediSearch/blob/master/src/stopwords.h.`);
      }
      throw error;
    }
    return searchResults;
  }
  keysToEntityIds(keys) {
    return keys.map((key) => this.keyToEntityId(key) ?? "");
  }
  keyToEntityId(key) {
    return key ? key.replace(`${this.schema.prefix}:`, "") : null;
  }
};
var RawSearch = class extends AbstractSearch {
  rawQuery;
  constructor(schema, client, query = "*") {
    super(schema, client);
    this.rawQuery = query;
  }
  get query() {
    return this.rawQuery;
  }
};
var Search = class extends AbstractSearch {
  rootWhere;
  get query() {
    if (this.rootWhere === void 0)
      return "*";
    return `${this.rootWhere.toString()}`;
  }
  where(fieldOrFn) {
    return this.anyWhere(WhereAnd, fieldOrFn);
  }
  and(fieldOrFn) {
    return this.anyWhere(WhereAnd, fieldOrFn);
  }
  or(fieldOrFn) {
    return this.anyWhere(WhereOr, fieldOrFn);
  }
  anyWhere(ctor, fieldOrFn) {
    if (typeof fieldOrFn === "string") {
      return this.anyWhereForField(ctor, fieldOrFn);
    } else {
      return this.anyWhereForFunction(ctor, fieldOrFn);
    }
  }
  anyWhereForField(ctor, field) {
    const where = this.createWhere(field);
    if (this.rootWhere === void 0) {
      this.rootWhere = where;
    } else {
      this.rootWhere = new ctor(this.rootWhere, where);
    }
    return where;
  }
  anyWhereForFunction(ctor, subSearchFn) {
    const search = new Search(this.schema, this.client);
    const subSearch = subSearchFn(search);
    if (subSearch.rootWhere === void 0) {
      throw new Error("Sub-search without and root where was somehow defined.");
    } else {
      if (this.rootWhere === void 0) {
        this.rootWhere = subSearch.rootWhere;
      } else {
        this.rootWhere = new ctor(this.rootWhere, subSearch.rootWhere);
      }
    }
    return this;
  }
  createWhere(field) {
    const fieldDef = this.schema.definition[field];
    if (fieldDef === void 0)
      throw new Error(`The field '${field}' is not part of the schema.`);
    if (fieldDef.type === "boolean" && this.schema.dataStructure === "HASH")
      return new WhereHashBoolean(this, field);
    if (fieldDef.type === "boolean" && this.schema.dataStructure === "JSON")
      return new WhereJsonBoolean(this, field);
    if (fieldDef.type === "date")
      return new WhereDate(this, field);
    if (fieldDef.type === "number")
      return new WhereNumber(this, field);
    if (fieldDef.type === "point")
      return new WherePoint(this, field);
    if (fieldDef.type === "text")
      return new WhereText(this, field);
    if (fieldDef.type === "string")
      return new WhereString(this, field);
    if (fieldDef.type === "string[]")
      return new WhereStringArray(this, field);
    throw new Error(`The field type of '${fieldDef.type}' is not a valid field type. Valid types include 'boolean', 'date', 'number', 'point', 'string', and 'string[]'.`);
  }
};

// lib/repository/index.ts
var Repository = class {
  client;
  schema;
  constructor(schema, client) {
    this.schema = schema;
    this.client = client;
  }
  async createIndex() {
    const currentIndexHash = await this.client.get(this.schema.indexHashName);
    if (currentIndexHash !== this.schema.indexHash) {
      await this.dropIndex();
      const options = {
        indexName: this.schema.indexName,
        dataStructure: this.schema.dataStructure,
        prefix: `${this.schema.prefix}:`,
        schema: this.schema.redisSchema
      };
      if (this.schema.useStopWords === "OFF")
        options.stopWords = [];
      if (this.schema.useStopWords === "CUSTOM")
        options.stopWords = this.schema.stopWords;
      await this.client.createIndex(options);
      await this.client.set(this.schema.indexHashName, this.schema.indexHash);
    }
  }
  async dropIndex() {
    try {
      await this.client.unlink(this.schema.indexHashName);
      await this.client.dropIndex(this.schema.indexName);
    } catch (e) {
      if (e instanceof Error && e.message === "Unknown Index name") {
      } else {
        throw e;
      }
    }
  }
  createEntity(data, entityId) {
    const id = entityId ?? this.schema.generateId();
    return new this.schema.entityCtor(this.schema, id, data);
  }
  async save(entity) {
    await this.writeEntity(entity);
    return entity.entityId;
  }
  async createAndSave(data, entityId) {
    const entity = this.createEntity(data, entityId);
    await this.save(entity);
    return entity;
  }
  async fetch(ids) {
    if (arguments.length > 1) {
      return this.readEntities([...arguments]);
    }
    if (Array.isArray(ids)) {
      return this.readEntities(ids);
    }
    const entities = await this.readEntities([ids]);
    return entities[0];
  }
  async remove(ids) {
    const keys = arguments.length > 1 ? this.makeKeys([...arguments]) : Array.isArray(ids) ? this.makeKeys(ids) : ids ? this.makeKeys([ids]) : [];
    if (keys.length === 0)
      return;
    await this.client.unlink(...keys);
  }
  async expire(id, ttlInSeconds) {
    const key = this.makeKey(id);
    await this.client.expire(key, ttlInSeconds);
  }
  search() {
    return new Search(this.schema, this.client);
  }
  searchRaw(query) {
    return new RawSearch(this.schema, this.client, query);
  }
  makeKeys(ids) {
    return ids.map((id) => this.makeKey(id));
  }
  makeKey(id) {
    return `${this.schema.prefix}:${id}`;
  }
};
var HashRepository = class extends Repository {
  async writeEntity(entity) {
    const data = entity.toRedisHash();
    if (Object.keys(data).length === 0) {
      await this.client.unlink(entity.keyName);
      return;
    }
    await this.client.hsetall(entity.keyName, data);
  }
  async readEntities(ids) {
    return Promise.all(
      ids.map(async (id) => {
        const key = this.makeKey(id);
        const hashData = await this.client.hgetall(key);
        const entity = new this.schema.entityCtor(this.schema, id);
        entity.fromRedisHash(hashData);
        return entity;
      })
    );
  }
};
var JsonRepository = class extends Repository {
  async writeEntity(entity) {
    await this.client.jsonset(entity.keyName, entity.toRedisJson());
  }
  async readEntities(ids) {
    return Promise.all(
      ids.map(async (id) => {
        const key = this.makeKey(id);
        const jsonData = await this.client.jsonget(key);
        const entity = new this.schema.entityCtor(this.schema, id);
        entity.fromRedisJson(jsonData);
        return entity;
      })
    );
  }
};

// lib/client.ts
var Client = class {
  redis;
  async use(connection) {
    await this.close();
    this.redis = connection;
    return this;
  }
  async open(url = "redis://localhost:6379") {
    if (!this.isOpen()) {
      this.redis = (0, import_redis.createClient)({ url });
      await this.redis.connect();
    }
    return this;
  }
  async execute(command) {
    this.validateRedisOpen();
    return this.redis.sendCommand(command.map((arg) => {
      if (arg === false)
        return "0";
      if (arg === true)
        return "1";
      return arg.toString();
    }));
  }
  fetchRepository(schema) {
    this.validateRedisOpen();
    if (schema.dataStructure === "JSON") {
      return new JsonRepository(schema, this);
    } else {
      return new HashRepository(schema, this);
    }
  }
  async close() {
    if (this.redis) {
      await this.redis.quit();
    }
    this.redis = void 0;
  }
  async createIndex(options) {
    this.validateRedisOpen();
    const { indexName, dataStructure, prefix, schema, stopWords } = options;
    const command = [
      "FT.CREATE",
      indexName,
      "ON",
      dataStructure,
      "PREFIX",
      "1",
      `${prefix}`
    ];
    if (stopWords !== void 0)
      command.push("STOPWORDS", `${stopWords.length}`, ...stopWords);
    command.push("SCHEMA", ...schema);
    await this.redis.sendCommand(command);
  }
  async dropIndex(indexName) {
    this.validateRedisOpen();
    await this.redis.sendCommand(["FT.DROPINDEX", indexName]);
  }
  async search(options) {
    this.validateRedisOpen();
    const { indexName, query, limit, sort, keysOnly } = options;
    const command = ["FT.SEARCH", indexName, query];
    if (limit !== void 0)
      command.push("LIMIT", limit.offset.toString(), limit.count.toString());
    if (sort !== void 0)
      command.push("SORTBY", sort.field, sort.order);
    if (keysOnly)
      command.push("RETURN", "0");
    return this.redis.sendCommand(command);
  }
  async unlink(...keys) {
    this.validateRedisOpen();
    if (keys.length > 0)
      await this.redis.unlink(keys);
  }
  async expire(key, ttl) {
    this.validateRedisOpen();
    await this.redis.expire(key, ttl);
  }
  async get(key) {
    this.validateRedisOpen();
    return this.redis.get(key);
  }
  async set(key, value) {
    this.validateRedisOpen();
    await this.redis.set(key, value);
  }
  async hgetall(key) {
    this.validateRedisOpen();
    return this.redis.hGetAll(key);
  }
  async hsetall(key, data) {
    this.validateRedisOpen();
    try {
      await this.redis.executeIsolated(async (isolatedClient) => {
        await isolatedClient.watch(key);
        await isolatedClient.multi().unlink(key).hSet(key, data).exec();
      });
    } catch (error) {
      if (error.name === "WatchError")
        throw new RedisError("Watch error when setting HASH.");
      throw error;
    }
  }
  async jsonget(key) {
    this.validateRedisOpen();
    const json = await this.redis.sendCommand(["JSON.GET", key, "."]);
    return JSON.parse(json);
  }
  async jsonset(key, data) {
    this.validateRedisOpen();
    const json = JSON.stringify(data);
    await this.redis.sendCommand(["JSON.SET", key, ".", json]);
  }
  isOpen() {
    return !!this.redis;
  }
  validateRedisOpen() {
    if (!this.redis)
      throw new RedisError("Redis connection needs to be open.");
  }
};

// lib/entity/fields/entity-field.ts
var EntityField = class {
  _name;
  _value = null;
  fieldDef;
  constructor(name, fieldDef, value) {
    this.fieldDef = fieldDef;
    this.value = value ?? null;
    this._name = name;
  }
  get name() {
    return this.fieldDef.alias ?? this._name;
  }
  get value() {
    return this._value;
  }
  set value(value) {
    this.validateValue(value);
    this._value = this.convertValue(value);
  }
  toRedisJson() {
    const data = {};
    if (this.value !== null)
      data[this.name] = this.value;
    return data;
  }
  fromRedisJson(value) {
    this.value = value;
  }
  toRedisHash() {
    const data = {};
    if (this.value !== null)
      data[this.name] = this.value.toString();
    return data;
  }
  fromRedisHash(value) {
    this.value = value;
  }
  validateValue(value) {
    if (value === void 0)
      throw Error(`Property cannot be set to undefined. Use null instead.`);
  }
  convertValue(value) {
    return value;
  }
  isString(value) {
    return typeof value === "string";
  }
  isNumber(value) {
    return typeof value === "number";
  }
  isBoolean(value) {
    return typeof value === "boolean";
  }
};

// lib/entity/fields/entity-boolean-field.ts
var EntityBooleanField = class extends EntityField {
  toRedisHash() {
    const data = {};
    if (this.value !== null)
      data[this.name] = this.value ? "1" : "0".toString();
    return data;
  }
  fromRedisHash(value) {
    if (value === "0") {
      this.value = false;
    } else if (value === "1") {
      this.value = true;
    } else {
      throw Error(`Non-boolean value of '${value}' read from Redis for boolean field.`);
    }
  }
  validateValue(value) {
    super.validateValue(value);
    if (value !== null && !this.isBoolean(value))
      throw Error(`Expected value with type of 'boolean' but received '${value}'.`);
  }
};

// lib/entity/fields/entity-date-field.ts
var EntityDateField = class extends EntityField {
  toRedisJson() {
    const data = {};
    if (this.value !== null)
      data[this.name] = this.valueAsNumber;
    return data;
  }
  fromRedisJson(value) {
    if (this.isNumber(value) || value === null)
      this.value = value;
    else
      throw Error(`Non-numeric value of '${value}' read from Redis for date field.`);
  }
  toRedisHash() {
    const data = {};
    if (this.value !== null)
      data[this.name] = this.valueAsNumber.toString();
    return data;
  }
  fromRedisHash(value) {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed))
      throw Error(`Non-numeric value of '${value}' read from Redis for date field.`);
    const date = new Date();
    date.setTime(parsed * 1e3);
    this.value = date;
  }
  validateValue(value) {
    super.validateValue(value);
    if (value !== null && !this.isDateable(value))
      throw Error(`Expected value with type of 'date' but received '${value}'.`);
  }
  convertValue(value) {
    if (this.isString(value)) {
      return new Date(value);
    }
    if (this.isNumber(value)) {
      const newValue = new Date();
      newValue.setTime(value * 1e3);
      return newValue;
    }
    return super.convertValue(value);
  }
  isDateable(value) {
    return this.isDate(value) || this.isNumber(value) || this.isString(value);
  }
  isDate(value) {
    return value instanceof Date;
  }
  get valueAsNumber() {
    return this.value.getTime() / 1e3;
  }
};

// lib/entity/fields/entity-number-field.ts
var EntityNumberField = class extends EntityField {
  fromRedisHash(value) {
    const number = Number.parseFloat(value);
    if (Number.isNaN(number))
      throw Error(`Non-numeric value of '${value}' read from Redis for number field.`);
    this.value = number;
  }
  validateValue(value) {
    super.validateValue(value);
    if (value !== null && !this.isNumber(value))
      throw Error(`Expected value with type of 'number' but received '${value}'.`);
  }
};

// lib/entity/fields/entity-point-field.ts
var IS_COORD_PAIR = /^-?\d+(\.\d*)?,-?\d+(\.\d*)?$/;
var EntityPointField = class extends EntityField {
  toRedisJson() {
    const data = {};
    if (this.value !== null)
      data[this.name] = this.valueAsString;
    return data;
  }
  fromRedisJson(value) {
    if (value === null) {
      this.value = null;
    } else if (value.toString().match(IS_COORD_PAIR)) {
      const [longitude, latitude] = value.split(",").map(Number.parseFloat);
      this.value = { longitude, latitude };
    } else {
      throw Error(`Non-point value of '${value}' read from Redis for point field.`);
    }
  }
  toRedisHash() {
    const data = {};
    if (this.value !== null)
      data[this.name] = this.valueAsString;
    return data;
  }
  fromRedisHash(value) {
    if (value.match(IS_COORD_PAIR)) {
      const [longitude, latitude] = value.split(",").map(Number.parseFloat);
      this.value = { longitude, latitude };
    } else {
      throw Error(`Non-point value of '${value}' read from Redis for point field.`);
    }
  }
  validateValue(value) {
    super.validateValue(value);
    if (value !== null) {
      if (!this.isPoint(value))
        throw Error(`Expected value with type of 'point' but received '${value}'.`);
      const { longitude, latitude } = value;
      if (Math.abs(latitude) > 85.05112878 || Math.abs(longitude) > 180)
        throw Error(`Expected value with valid 'point' but received '${longitude},${latitude}'.`);
    }
  }
  isPoint(value) {
    return this.isNumber(value.longitude) && this.isNumber(value.latitude);
  }
  get valueAsString() {
    const { longitude, latitude } = this.value;
    return `${longitude},${latitude}`;
  }
};

// lib/entity/fields/entity-string-array-field.ts
var EntityStringArrayField = class extends EntityField {
  toRedisHash() {
    const data = {};
    if (this.value !== null)
      data[this.name] = this.value.join(this.separator);
    return data;
  }
  fromRedisHash(value) {
    this.value = value.split(this.separator);
  }
  validateValue(value) {
    super.validateValue(value);
    if (value !== null && !this.isArray(value))
      throw Error(`Expected value with type of 'string[]' but received '${value}'.`);
  }
  convertValue(value) {
    if (this.isArray(value)) {
      return value.map((v) => v.toString());
    }
    return super.convertValue(value);
  }
  get separator() {
    return this.fieldDef.separator ?? "|";
  }
  isArray(value) {
    return Array.isArray(value);
  }
};

// lib/entity/fields/entity-stringish-field.ts
var EntityStringishField = class extends EntityField {
  convertValue(value) {
    if (value !== null && this.isStringable(value)) {
      return value.toString();
    }
    return super.convertValue(value);
  }
  isStringable(value) {
    return this.isString(value) || this.isNumber(value) || this.isBoolean(value);
  }
};

// lib/entity/fields/entity-string-field.ts
var EntityStringField = class extends EntityStringishField {
  validateValue(value) {
    super.validateValue(value);
    if (value !== null && !this.isStringable(value))
      throw Error(`Expected value with type of 'string' but received '${value}'.`);
  }
};

// lib/entity/fields/entity-text-field.ts
var EntityTextField = class extends EntityStringishField {
  validateValue(value) {
    super.validateValue(value);
    if (value !== null && !this.isStringable(value))
      throw Error(`Expected value with type of 'text' but received '${value}'.`);
  }
};

// lib/entity/entity.ts
var ENTITY_FIELD_CONSTRUCTORS = {
  "string": EntityStringField,
  "number": EntityNumberField,
  "boolean": EntityBooleanField,
  "text": EntityTextField,
  "date": EntityDateField,
  "point": EntityPointField,
  "string[]": EntityStringArrayField
};
var Entity = class {
  entityId;
  schemaDef;
  prefix;
  entityFields = {};
  constructor(schema, id, data = {}) {
    this.schemaDef = schema.definition;
    this.prefix = schema.prefix;
    this.entityId = id;
    this.createFields(data);
  }
  createFields(data) {
    Object.keys(this.schemaDef).forEach((fieldName) => {
      const fieldDef = this.schemaDef[fieldName];
      const fieldType = fieldDef.type;
      const fieldAlias = fieldDef.alias ?? fieldName;
      const fieldValue = data[fieldAlias] ?? null;
      const entityField = new ENTITY_FIELD_CONSTRUCTORS[fieldType](fieldName, fieldDef, fieldValue);
      this.entityFields[fieldAlias] = entityField;
    });
  }
  get keyName() {
    return `${this.prefix}:${this.entityId}`;
  }
  toJSON() {
    const json = { entityId: this.entityId };
    Object.keys(this.schemaDef).forEach((field) => {
      json[field] = this[field];
    });
    return json;
  }
  toRedisJson() {
    let data = {};
    Object.keys(this.entityFields).forEach((field) => {
      const entityField = this.entityFields[field];
      data = { ...data, ...entityField.toRedisJson() };
    });
    return data;
  }
  fromRedisJson(data) {
    if (!data)
      return data;
    Object.keys(data).forEach((field) => {
      this.entityFields[field].fromRedisJson(data[field]);
    });
  }
  toRedisHash() {
    let data = {};
    Object.keys(this.entityFields).forEach((field) => {
      const entityField = this.entityFields[field];
      data = { ...data, ...entityField.toRedisHash() };
    });
    return data;
  }
  fromRedisHash(data) {
    Object.keys(data).forEach((field) => {
      this.entityFields[field].fromRedisHash(data[field]);
    });
  }
};

// lib/schema/schema.ts
var import_crypto = require("crypto");

// node_modules/.pnpm/ulid@2.3.0/node_modules/ulid/dist/index.esm.js
function createError(message) {
  var err = new Error(message);
  err.source = "ulid";
  return err;
}
var ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
var ENCODING_LEN = ENCODING.length;
var TIME_MAX = Math.pow(2, 48) - 1;
var TIME_LEN = 10;
var RANDOM_LEN = 16;
function randomChar(prng) {
  var rand = Math.floor(prng() * ENCODING_LEN);
  if (rand === ENCODING_LEN) {
    rand = ENCODING_LEN - 1;
  }
  return ENCODING.charAt(rand);
}
function encodeTime(now, len) {
  if (isNaN(now)) {
    throw new Error(now + " must be a number");
  }
  if (now > TIME_MAX) {
    throw createError("cannot encode time greater than " + TIME_MAX);
  }
  if (now < 0) {
    throw createError("time must be positive");
  }
  if (Number.isInteger(now) === false) {
    throw createError("time must be an integer");
  }
  var mod = void 0;
  var str = "";
  for (; len > 0; len--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}
function encodeRandom(len, prng) {
  var str = "";
  for (; len > 0; len--) {
    str = randomChar(prng) + str;
  }
  return str;
}
function detectPrng() {
  var allowInsecure = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
  var root = arguments[1];
  if (!root) {
    root = typeof window !== "undefined" ? window : null;
  }
  var browserCrypto = root && (root.crypto || root.msCrypto);
  if (browserCrypto) {
    return function() {
      var buffer = new Uint8Array(1);
      browserCrypto.getRandomValues(buffer);
      return buffer[0] / 255;
    };
  } else {
    try {
      var nodeCrypto = require("crypto");
      return function() {
        return nodeCrypto.randomBytes(1).readUInt8() / 255;
      };
    } catch (e) {
    }
  }
  if (allowInsecure) {
    try {
      console.error("secure crypto unusable, falling back to insecure Math.random()!");
    } catch (e) {
    }
    return function() {
      return Math.random();
    };
  }
  throw createError("secure crypto unusable, insecure Math.random not allowed");
}
function factory(currPrng) {
  if (!currPrng) {
    currPrng = detectPrng();
  }
  return function ulid2(seedTime) {
    if (isNaN(seedTime)) {
      seedTime = Date.now();
    }
    return encodeTime(seedTime, TIME_LEN) + encodeRandom(RANDOM_LEN, currPrng);
  };
}
var ulid = factory();

// lib/schema/builders/schema-builder.ts
var SchemaBuilder = class {
  schema;
  constructor(schema) {
    this.schema = schema;
  }
  get redisSchema() {
    const redisSchema = [];
    Object.keys(this.schema.definition).forEach((field) => {
      redisSchema.push(...this.buildEntry(field));
    });
    return redisSchema;
  }
  buildCaseInsensitive(field) {
    return field.caseSensitive ? ["CASESENSITIVE"] : [];
  }
  buildIndexed(field) {
    return field.indexed ?? this.schema.indexedDefault ? [] : ["NOINDEX"];
  }
  buildStemming(field) {
    return field.stemming ?? true ? [] : ["NOSTEM"];
  }
  buildPhonetic(field) {
    return field.matcher ? ["PHONETIC", field.matcher] : [];
  }
  buildSeparable(field) {
    return ["SEPARATOR", field.separator || "|"];
  }
  buildSortable(field) {
    return field.sortable ? ["SORTABLE"] : [];
  }
  buildNormalized(field) {
    return field.normalized ?? true ? [] : ["UNF"];
  }
  buildWeight(field) {
    return field.weight ? ["WEIGHT", field.weight.toString()] : [];
  }
};

// lib/schema/builders/hash-schema-builder.ts
var HashSchemaBuilder = class extends SchemaBuilder {
  buildEntry(field) {
    const fieldDef = this.schema.definition[field];
    const fieldAlias = fieldDef.alias ?? field;
    switch (fieldDef.type) {
      case "date":
        return [
          fieldAlias,
          "NUMERIC",
          ...this.buildSortable(fieldDef),
          ...this.buildIndexed(fieldDef)
        ];
      case "boolean":
        return [
          fieldAlias,
          "TAG",
          ...this.buildSortable(fieldDef),
          ...this.buildIndexed(fieldDef)
        ];
      case "number":
        return [
          fieldAlias,
          "NUMERIC",
          ...this.buildSortable(fieldDef),
          ...this.buildIndexed(fieldDef)
        ];
      case "point":
        return [
          fieldAlias,
          "GEO",
          ...this.buildIndexed(fieldDef)
        ];
      case "string[]":
      case "string":
        return [
          fieldAlias,
          "TAG",
          ...this.buildCaseInsensitive(fieldDef),
          ...this.buildSeparable(fieldDef),
          ...this.buildSortable(fieldDef),
          ...this.buildNormalized(fieldDef),
          ...this.buildIndexed(fieldDef)
        ];
      case "text":
        return [
          fieldAlias,
          "TEXT",
          ...this.buildStemming(fieldDef),
          ...this.buildPhonetic(fieldDef),
          ...this.buildSortable(fieldDef),
          ...this.buildNormalized(fieldDef),
          ...this.buildWeight(fieldDef),
          ...this.buildIndexed(fieldDef)
        ];
    }
    ;
  }
};

// lib/schema/builders/json-schema-builder.ts
var JsonSchemaBuilder = class extends SchemaBuilder {
  buildEntry(field) {
    const fieldDef = this.schema.definition[field];
    const fieldAlias = fieldDef.alias ?? field;
    const fieldPath = `$.${fieldAlias}${fieldDef.type === "string[]" ? "[*]" : ""}`;
    const fieldInfo = [fieldPath, "AS", fieldAlias];
    switch (fieldDef.type) {
      case "date":
        return [
          ...fieldInfo,
          "NUMERIC",
          ...this.buildSortable(fieldDef),
          ...this.buildIndexed(fieldDef)
        ];
      case "boolean":
        if (fieldDef.sortable)
          console.warn(`You have marked the boolean field '${field}' as sortable but RediSearch doesn't support the SORTABLE argument on a TAG for JSON. Ignored.`);
        return [
          ...fieldInfo,
          "TAG",
          ...this.buildIndexed(fieldDef)
        ];
      case "number":
        return [
          ...fieldInfo,
          "NUMERIC",
          ...this.buildSortable(fieldDef),
          ...this.buildIndexed(fieldDef)
        ];
      case "point":
        return [
          ...fieldInfo,
          "GEO",
          ...this.buildIndexed(fieldDef)
        ];
      case "string[]":
      case "string":
        if (fieldDef.sortable)
          console.warn(`You have marked the ${fieldDef.type} field '${field}' as sortable but RediSearch doesn't support the SORTABLE argument on a TAG for JSON. Ignored.`);
        return [
          ...fieldInfo,
          "TAG",
          ...this.buildCaseInsensitive(fieldDef),
          ...this.buildSeparable(fieldDef),
          ...this.buildNormalized(fieldDef),
          ...this.buildIndexed(fieldDef)
        ];
      case "text":
        return [
          ...fieldInfo,
          "TEXT",
          ...this.buildStemming(fieldDef),
          ...this.buildPhonetic(fieldDef),
          ...this.buildSortable(fieldDef),
          ...this.buildNormalized(fieldDef),
          ...this.buildWeight(fieldDef),
          ...this.buildIndexed(fieldDef)
        ];
    }
    ;
  }
};

// lib/schema/schema.ts
var Schema = class {
  entityCtor;
  definition;
  options;
  constructor(ctor, schemaDef, options) {
    this.entityCtor = ctor;
    this.definition = schemaDef;
    this.options = options;
    this.validateOptions();
    this.defineProperties();
  }
  get prefix() {
    var _a;
    return ((_a = this.options) == null ? void 0 : _a.prefix) ?? this.entityCtor.name;
  }
  get indexName() {
    var _a;
    return ((_a = this.options) == null ? void 0 : _a.indexName) ?? `${this.prefix}:index`;
  }
  get indexHashName() {
    var _a;
    return ((_a = this.options) == null ? void 0 : _a.indexHashName) ?? `${this.prefix}:index:hash`;
  }
  get dataStructure() {
    var _a;
    return ((_a = this.options) == null ? void 0 : _a.dataStructure) ?? "JSON";
  }
  get useStopWords() {
    var _a;
    return ((_a = this.options) == null ? void 0 : _a.useStopWords) ?? "DEFAULT";
  }
  get stopWords() {
    var _a;
    return ((_a = this.options) == null ? void 0 : _a.stopWords) ?? [];
  }
  get indexedDefault() {
    var _a;
    return ((_a = this.options) == null ? void 0 : _a.indexedDefault) ?? true;
  }
  get indexHash() {
    const data = JSON.stringify({
      definition: this.definition,
      prefix: this.prefix,
      indexName: this.indexName,
      indexHashName: this.indexHashName,
      dataStructure: this.dataStructure,
      useStopWords: this.useStopWords,
      stopWords: this.stopWords
    });
    return (0, import_crypto.createHash)("sha1").update(data).digest("base64");
  }
  get redisSchema() {
    if (this.dataStructure === "HASH")
      return new HashSchemaBuilder(this).redisSchema;
    if (this.dataStructure === "JSON")
      return new JsonSchemaBuilder(this).redisSchema;
    throw new Error(`'${this.dataStructure}' in an invalid data structure. Valid data structures are 'HASH' and 'JSON'.`);
  }
  generateId() {
    var _a;
    const ulidStrategy = () => ulid();
    return (((_a = this.options) == null ? void 0 : _a.idStrategy) ?? ulidStrategy)();
  }
  defineProperties() {
    Object.keys(this.definition).forEach((fieldName) => {
      const fieldDef = this.definition[fieldName];
      const fieldAlias = fieldDef.alias ?? fieldName;
      this.validateFieldDef(fieldName, fieldDef);
      Object.defineProperty(this.entityCtor.prototype, fieldName, {
        configurable: true,
        get: function() {
          return this.entityFields[fieldAlias].value;
        },
        set: function(value) {
          this.entityFields[fieldAlias].value = value;
        }
      });
    });
  }
  validateOptions() {
    var _a;
    if (!["HASH", "JSON"].includes(this.dataStructure))
      throw Error(`'${this.dataStructure}' in an invalid data structure. Valid data structures are 'HASH' and 'JSON'.`);
    if (!["OFF", "DEFAULT", "CUSTOM"].includes(this.useStopWords))
      throw Error(`'${this.useStopWords}' in an invalid value for stop words. Valid values are 'OFF', 'DEFAULT', and 'CUSTOM'.`);
    if (((_a = this.options) == null ? void 0 : _a.idStrategy) && !(this.options.idStrategy instanceof Function))
      throw Error("ID strategy must be a function that takes no arguments and returns a string.");
    if (this.prefix === "")
      throw Error(`Prefix must be a non-empty string.`);
    if (this.indexName === "")
      throw Error(`Index name must be a non-empty string.`);
  }
  validateFieldDef(field, fieldDef) {
    if (!["boolean", "date", "number", "point", "string", "string[]", "text"].includes(fieldDef.type))
      throw Error(`The field '${field}' is configured with a type of '${fieldDef.type}'. Valid types include 'boolean', 'date', 'number', 'point', 'string', 'string[]', and 'text'.`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AbstractSearch,
  Circle,
  Client,
  Entity,
  RawSearch,
  RedisError,
  Repository,
  Schema,
  Search,
  Where,
  WhereField
});
