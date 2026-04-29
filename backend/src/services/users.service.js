import { usersRepository } from "../repositories/users.repository.js";

export const usersService = {
  getUserViaEmail: async (email) => {
    try {
      const user = await usersRepository.getUserViaEmail(email);
      return user;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}