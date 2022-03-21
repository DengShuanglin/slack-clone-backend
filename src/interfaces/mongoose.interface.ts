/**
 * @file Mongoose & Model & Paginate interface
 * @module interface/mongoose
 * @author Name6
 */

import { Document } from 'mongoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { PaginateModel } from '@/utils/paginate';

export type MongooseModel<T> = ModelType<T> & PaginateModel<Document & T>;
