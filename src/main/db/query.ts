// import Joi from 'joi';
// const JoiObjectId = require('joi-oid');
import logger from '../logger';
// import { MONGO } from '../../constants';

/**
 * UserChat model
 */
class UserProfile {
  public collectionName: any;
  public collection: any;
  public db: any;
  /**
   * initialised collection
   * @param {Instance} db
   */
  constructor(db: any) {
    // super(db);
    this.db = db;
    // this.collectionName = MONGO.CHAT;
    // this.collection = db.collection(this.collectionName);
  }

  updateCollection(collection: string) {
    this.collectionName = collection;
    this.collection = this.db.collection(this.collectionName);
  }

  /**
   * @param {object} info
   * @returns throw error if required field is not in info object
   */
  //   requiredFields(info: any) {
  //     return super.checkRequiredFields(info, ['to']);
  //   }

  /**
   * add a document to user table
   * @param {Object} info
   * @returns {Object} create document
   */
  async add(collectionName: string, info: any, opts = {returnOriginal: true}) {
    try {
      const inserteData = await this.db
        .collection(collectionName)
        .insertOne(info, opts);
      return {_id: inserteData.inserteId, ...inserteData.ops[0]};
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  /**
   *
   * @param {Array} info
   * @param {Object} opts
   * @returns
   */
  async bulkAdd(users: any, opts = {returnOriginal: false}) {
    return this.collection.insertMany(users, opts);
  }

  /**
   *
   * @param {Object} _id
   * @param {Object} info
   * @returns {Object} updated document
   */
  async update(
    collectionName: string,
    _id: any,
    info: any,
    opts = {returnOriginal: false},
  ) {
    // const updateObj = super.beforeUpdate(info.$set);
    // const isValidSchema = this.joiSchema().validate(updateObj);
    // if (isValidSchema.error) throw isValidSchema.error;
    return this.db.collection(collectionName).updateOne(
      {_id},
      info,
      //   { $set: isValidSchema.value },
      opts,
    );
  }

  async updateByCond(
    collectionName: string,
    where: any,
    info: any,
    opts = {returnOriginal: false},
  ) {
    // const updateObj = super.beforeUpdate(info.$set);
    // const isValidSchema = this.joiSchema().validate(updateObj);
    // if (isValidSchema.error) throw isValidSchema.error;

    return this.db.collection(collectionName).updateOne(
      where,
      //   { $set: isValidSchema.value },
      info,
      opts,
    );
  }

  /**
   * Find a specific document by ID
   * @param {Object} _id
   * @returns {Object} a document
   */
  async get(collectionName: string, where: any) {
    return this.db.collection(collectionName).find(where).toArray();
  }
  async getlobby(collectionName: string, where: any, field: any) {
    return this.db.collection(collectionName).find(where).sort(field).toArray();
  }
  async countDocument(collectionName: string, where: any) {
    return this.db.collection(collectionName).countDocuments(where);
  }

  async getTrackedlobby(
    collectionName: string,
    where: any,
    start: any,
    limit: any,
  ) {
    return this.db
      .collection(collectionName)
      .find(where)
      .skip(start)
      .limit(limit)
      .toArray();
  }

  async getOne(collectionName: any, where: any) {
    return this.db.collection(collectionName).findOne(where);
  }
  async remove(collectionName: any, where: any) {
    return this.db.collection(collectionName).deleteOne(where);
  }

  async removeAll(collectionName: any, where: any) {
    return this.db.collection(collectionName).deleteMany(where);
  }
}

export = UserProfile;
