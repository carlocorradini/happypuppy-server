/* eslint-disable no-dupe-class-members */
// eslint-disable-next-line no-unused-vars
import { getMetadataArgsStorage } from 'typeorm';
// eslint-disable-next-line no-unused-vars
import { ColumnMetadataArgs } from 'typeorm/metadata-args/ColumnMetadataArgs';
// eslint-disable-next-line no-unused-vars
import { MetadataArgsStorage } from 'typeorm/metadata-args/MetadataArgsStorage';

export default class EntityUtil {
  private static storage(): MetadataArgsStorage {
    return getMetadataArgsStorage();
  }

  private static getPropertyName(column: ColumnMetadataArgs): string {
    return column.propertyName;
  }

  public static columns(entity: string | Function): ColumnMetadataArgs[] {
    return this.storage().filterColumns(entity);
  }

  public static selectableColumns<E extends Function>(entity: E): (keyof E['prototype'])[];

  public static selectableColumns<E extends Function>(
    entity: E,
    addColumns: (keyof E['prototype'])[]
  ): (keyof E['prototype'])[];

  public static selectableColumns<E extends Function>(
    entity: E,
    addColumns?: (keyof E)[]
  ): (keyof E['prototype'])[] {
    return this.columns(entity)
      .filter((column) => {
        return column.options.select === undefined || column.options.select === true;
      })
      .map(this.getPropertyName)
      .concat(Array.isArray(addColumns) ? (addColumns as string[]) : []);
  }

  public static uniqueColumns<E extends Function>(entity: E): (keyof E['prototype'])[] {
    return this.columns(entity)
      .filter((column) => {
        return column.options.unique === true;
      })
      .map(this.getPropertyName);
  }
}
