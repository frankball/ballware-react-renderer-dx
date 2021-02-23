import { CrudItem } from '@ballware/meta-interface';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';

export function createReadonlyDatasource(
  fetchFunc: () => Promise<Array<Record<string, unknown>>>,
  mapFunction?: (item: any) => any,
  keyProperty = 'Id'
): DataSource {
  const dataStore = new CustomStore({
    loadMode: 'raw',
    key: keyProperty,
    load: function () {
      return fetchFunc().then((result) => {
        return result;
      });
    },
  });

  const dataSource = new DataSource({
    store: dataStore,
    map: mapFunction,
  });

  return dataSource;
}

export function createEditableGridDatasource(
  items: Array<CrudItem>,
  save: (item: CrudItem) => void,
  keyProperty = 'Id'
) {
  const dataStore = new CustomStore({
    loadMode: 'raw',
    key: keyProperty,
    load: function () {
      return Promise.resolve(items);
    },
    byKey: function (key: string) {
      return Promise.resolve(items?.find((item) => item.Id === key));
    },
    update: function (key: string, values: CrudItem) {
      let item = items?.find((item) => item[keyProperty] === key);

      if (item) {
        item = Object.assign(item, values);

        save(item);

        return Promise.resolve({ key: key, values: item });
      }

      return Promise.reject(`Item with key ${key} not found`);
    },
  });

  const dataSource = new DataSource({
    store: dataStore,
  });

  return dataSource;
}

export function createArrayDatasource(
  data: any[],
  keyProperty = 'Id'
): DataSource {
  const dataSource = new DataSource({
    store: {
      type: 'array',
      key: keyProperty,
      data: data,
    },
  });

  return dataSource;
}

interface LookupCache {
  [key: string]: any;
}

export function createLookupDataSource(
  fetchListFunc: () => Promise<Array<Record<string, unknown>>>,
  byIdFunc: (id: string) => Promise<Record<string, unknown>>,
  keyProperty = 'Id'
): DataSource {
  let valueCache: LookupCache = {};

  const dataStore = new CustomStore({
    key: keyProperty,
    loadMode: 'raw',
    load: function () {
      return fetchListFunc().then((result) => {
        return result;
      });
    },
    byKey: function (key) {
      if (
        typeof key === 'undefined' ||
        key === '00000000-0000-0000-0000-000000000000'
      ) {
        return null;
      }

      if (valueCache[key]) {
        return valueCache[key];
      }

      return byIdFunc(key).then((result) => {
        valueCache[key] = result;

        return result;
      });
    },
  });

  const dataSource = new DataSource({
    store: dataStore,
  });

  return dataSource;
}

export function createAutocompleteDataSource(
  fetchFunc: () => Promise<Array<unknown>>
): DataSource {
  const dataStore = new CustomStore({
    loadMode: 'raw',
    load: function () {
      return fetchFunc().then((result) => {
        return result;
      });
    },
  });

  const dataSource = new DataSource({
    store: dataStore,
  });

  return dataSource;
}
