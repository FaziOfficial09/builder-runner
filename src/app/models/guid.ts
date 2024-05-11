export class Guid {
    static newGuid() {
        let data = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        return data.split("-")[0];
    }
    static new16DigitGuid() {
        // return 'xxxxxxxxxxxx4xxxy'.replace(/[xy]/g, function (c) {
        //   const r = (Math.random() * 16) | 0;
        //   const v = c === 'x' ? r : (r & 0x3) | 0x8;
        //   return v.toString(16);
        // });
        let data = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        return data;
      }
}