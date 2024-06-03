import { Model, Document, PipelineStage } from 'mongoose';

export default class DatabaseService<T extends Document> {
  constructor(private readonly model: Model<T>) {}

  public async findOne(query: object): Promise<T | null> {
    return this.model.findOne(query).exec();
  }

  public async save(document: T): Promise<T> {
    return document.save();
  }

  public async aggregate<U>(pipeline: PipelineStage[]): Promise<U[]> {
    return this.model.aggregate(pipeline).exec();
  }

  public create(document: Partial<T>): T {
    return new this.model(document);
  }
}
