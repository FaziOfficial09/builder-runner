// pending
// export interface ApiResponse<T> {
//     isSuccess: boolean;
//     message: string;
//     data?:  T[]
// }

export interface ApiResponse {
    isSuccess: boolean;
    message: string;
    data?: any;
    count?:number;
  }

