/**
 * @file mongoose paginate plugin
 * @module utils/paginate
 * @author Name6
 */

import { Model, Document, Schema, FilterQuery, QueryOptions } from 'mongoose';

export interface PaginateResult<T> {
  items: Array<T>;
  total: number;
  page: number;
  pageSize: number;
  totalPage: number;
  offset?: number;
}

export interface PaginateOptions {
  /** paginate options */
  page: number;
  pageSize: number;
  offset: number;
  select: string | object;
  /** mongoose queryOptions */
  sort: QueryOptions['sort'];
  populate: QueryOptions['populate'];
  lean: QueryOptions['lean'];
  /** original options for `model.find` */
  queryOptions: QueryOptions;
}

const DEFAULT_OPTIONS = Object.freeze({
  page: 1,
  pageSize: 10,
  offset: 0,
  lean: false,
});

export interface PaginateModel<T extends Document> extends Model<T> {
  paginate(
    query?: FilterQuery<T>,
    options?: Partial<PaginateOptions>,
  ): Promise<PaginateResult<T>>;
}

export function mongoosePaginate(schema: Schema) {
  schema.statics.paginate = paginate;
}

export function paginate<T>(
  this: Model<T>,
  filterQuery: FilterQuery<T> = {},
  options: Partial<PaginateOptions> = {},
) {
  const { page, pageSize, offset, select, queryOptions, ...resetOptions } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const skip = offset > 0 ? offset : (page - 1) * pageSize;

  const countQuery = this.countDocuments
    ? this.countDocuments(filterQuery).exec()
    : this.count(filterQuery).exec();
  const pageQuery = this.find(filterQuery, select, {
    skip,
    limit: pageSize,
    ...resetOptions,
    ...queryOptions,
  }).exec();

  return Promise.all([countQuery, pageQuery]).then(([countResult, pageResult]) => {
    const result: PaginateResult<T> = {
      items: pageResult,
      total: countResult,
      page,
      pageSize,
      totalPage: Math.ceil(countResult / pageSize) || 1,
    };

    return result;
  });
}
