// Newest1 - Start

import { findAllUsers, updateUserLogTime, addUserDetails } from '~/repository/user.repository';

export async function getAllUsers() {
  const allUsers = await findAllUsers();
  const allUsersSansPassword = allUsers.map(({ password, ...restProps }) => restProps);
  return allUsersSansPassword;
}

export async function setUserLogTime(id, lastLoggedAt) {
  const updatedUser = await updateUserLogTime(id, lastLoggedAt);
  return updatedUser;
}

export async function insertUsers(data) {
  const insertUserDetails = await addUserDetails(data);
  return insertUserDetails;
}

// Newest1 - End
