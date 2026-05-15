import { api } from "./api";

export const checkinService = {
  checkin: async (qrCodeRawValue) => {
    try {
      console.log(`Sending ${qrCodeRawValue}`);
    } catch (e) {
      console.log(e);
    }
  },

  syncCheckinData: async (data) => {
    try {
      console.log(data);
    } catch (e) {
      console.log(e);
    }
  }
}