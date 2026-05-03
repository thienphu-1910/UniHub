import { userRepository } from "../repositories/user.repository.js";

export const userService = {
  getUserViaEmail: async (email) => {
    try {
      const user = await userRepository.getUserViaEmail(email);
      return user;
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  getUserViaId: async (id) => {
    try {
      const user = await userRepository.getUserViaId(id);
      return user;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
};
