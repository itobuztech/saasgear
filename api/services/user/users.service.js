// Newest1 - Start

import { findAllUsers, updateUserLogTime } from '~/repository/user.repository';

export async function getAllUsers() {
  const allUsers = await findAllUsers();
  const allUsersSansPassword = allUsers.map(({ password, ...restProps }) => restProps);
  return allUsersSansPassword;
}

export async function setUserLogTime(id, lastLoggedAt) {
  const updatedUser = await updateUserLogTime(id, lastLoggedAt);
  return updatedUser;
}

// Newest1 - End
