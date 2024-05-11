import Dexie from 'dexie';

interface DBModel {
  id?: number;
  pid: string; //pageName
  jsonData: any;
  vid: string; //version 
  did: string; //domain
}

export class AutomergeService {
  private db: MyAutoMergeDatabase;

  constructor() {
    this.db = new MyAutoMergeDatabase();
  }

  // async saveData(pageName: string, data: any, version: number, domain: string): Promise<void> {
  //   try {
  //     const obj = { pageName, jsonData: data, version, domain };
  //     await this.db.myTable.add(obj);
  //   } catch (error) {
  //     console.error('Error saving data:', error);
  //     throw error;
  //   }
  // }

  async getNode(pageName: string, domain: string): Promise<any> {
    try {
      return await this.db.myTable
        .where('pid')
        .equals(pageName)
        .and(node => node.did === domain)
        .first();
    } catch (error) {
      console.error('Error getting node:', error);
      throw error;
    }
  }

  async deleteData(pageName: string, domain: string): Promise<void> {
    try {
      await this.db.myTable
      .where('pid')
      .equals(pageName)
      .and(node => node.did === domain)
      .delete();
      console.log('Data successfully deleted');
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }

  // async updateData(pageName: string, data: any, version: number, domain: string): Promise<void> {
  //   try {
  //     const obj = { pageName, jsonData: data, version, domain };
  //     await this.db.myTable
  //       .where({ pageName, domain })
  //       .modify(obj);
  //   } catch (error) {
  //     console.error('Error updating data:', error);
  //     throw error;
  //   }
  // }
  async saveData(pageName: string, data: any, domain: string,version:string): Promise<void> {
    try {
      const obj = { pid:pageName, jsonData: data, vid:version, did:domain };
      await this.db.myTable.put(obj);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  }

  async updateData(pageName: string, data: any, domain: string,version:string): Promise<void> {
    try {
      const existingData = await this.getNode(pageName, domain);
      if (existingData) {
        const obj = { ...existingData, jsonData: data,vid:version };
        await this.db.myTable.put(obj);
      } else {
        throw new Error('Data not found for update.');
      }
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }
}

class MyAutoMergeDatabase extends Dexie {
  myTable: Dexie.Table<DBModel, number>;

  constructor() {
    super('MyAutoMergeDatabase');
    this.version(3).stores({
      myTable: '++id,pid,jsondata,vid,did',
    }).upgrade(tx => {
      // Ensure the id field is indexed
      return tx.table('myTable').toCollection().modify(record => record.id);
    });

    this.myTable = this.table('myTable');
  }
}
