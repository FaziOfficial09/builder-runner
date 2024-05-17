import Dexie from 'dexie';

interface dbModel {
  id?: number;
  screenName: string;
  appid: string;
  type: string;
  data: any;
}

export class DataService {
  private db: MyDatabase;

  constructor() {
    this.db = new MyDatabase();
  }

  async saveData(screenName: string, appid: string, type: string, data: any): Promise<void> {
    const obj = { screenName: screenName, appid: appid, type: type, data: data };
    await this.db.myTable.add(obj);
    this.getNodes(appid, screenName, type);
  }

  async getNodes(appid: string, screenName: string, type: string): Promise<any[]> {
    try {
      // Check if the appid is a valid string
      if (typeof appid !== 'string' || appid.trim() === '') {
        throw new Error('Invalid appid');
      }

      // Query the database
      let check = await this.db.myTable
        .where('appid')
        .equals(appid)
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



  async deleteDb(appid: string, screenName: string, type: string): Promise<void> {
    await this.db.myTable.where({ appid: appid, screenName: screenName, type: type }).delete();
    console.log("Data successfully deleted");
  }

  async addData(screenName: string, appid: string, type: string, data: any): Promise<void> {
    const obj = { screenName: screenName, appid: appid, type: type, data: data };

    // Use the put method to insert or update the record based on the primary key
    await this.db.myTable.put(obj);

    this.getNodes(appid, screenName, type);
  }
}

class MyDatabase extends Dexie {
  myTable: Dexie.Table<dbModel, number>;

  constructor() {
    super('MyDatabase');
    this.version(2).stores({
      myTable: '++id,screenName,appid,type,data', // Include appid as an indexed field
    }).upgrade(async (trans) => {
      // Ensure the appid field is indexed
      await trans.table('myTable').toCollection().modify((record) => {
        record.appid; // This read will ensure the index is created
      });
    });

    this.myTable = this.table('myTable');
  }
}

