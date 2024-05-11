import Dexie from 'dexie';

interface dbModel {
  id?: number;
  screenName: string;
  applicationId: string;
  type: string;
  data: any;
}

export class DataService {
  private db: MyDatabase;

  constructor() {
    this.db = new MyDatabase();
  }

  async saveData(screenName: string, applicationId: string, type: string, data: any): Promise<void> {
    const obj = { screenName: screenName, applicationId: applicationId, type: type, data: data };
    await this.db.myTable.add(obj);
    this.getNodes(applicationId, screenName, type);
  }

  async getNodes(applicationId: string, screenName: string, type: string): Promise<any[]> {
    try {
      // Check if the applicationId is a valid string
      if (typeof applicationId !== 'string' || applicationId.trim() === '') {
        throw new Error('Invalid applicationId');
      }

      // Query the database
      let check = await this.db.myTable
        .where('applicationId')
        .equals(applicationId)
        .and(node => node.screenName === screenName && node.type === type)
        .toArray();

      return check;
    } catch (error) {
      // Handle errors here, you can log or re-throw as needed
      // console.error('Error in getNodes:', error);
      // throw error; // Rethrow the error to let the caller handle it
      return [];
    }
  }



  async deleteDb(applicationId: string, screenName: string, type: string): Promise<void> {
    await this.db.myTable.where({ applicationId: applicationId, screenName: screenName, type: type }).delete();
    console.log("Data successfully deleted");
  }

  async addData(screenName: string, applicationId: string, type: string, data: any): Promise<void> {
    const obj = { screenName: screenName, applicationId: applicationId, type: type, data: data };

    // Use the put method to insert or update the record based on the primary key
    await this.db.myTable.put(obj);

    this.getNodes(applicationId, screenName, type);
  }
}

class MyDatabase extends Dexie {
  myTable: Dexie.Table<dbModel, number>;

  constructor() {
    super('MyDatabase');
    this.version(2).stores({
      myTable: '++id,screenName,applicationId,type,data', // Include applicationId as an indexed field
    }).upgrade(async (trans) => {
      // Ensure the applicationId field is indexed
      await trans.table('myTable').toCollection().modify((record) => {
        record.applicationId; // This read will ensure the index is created
      });
    });

    this.myTable = this.table('myTable');
  }
}

