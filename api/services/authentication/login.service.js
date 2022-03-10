import { ValidationError, AuthenticationError } from 'apollo-server-express';
import { comparePassword } from '~/helpers/hashing.helper';
import { sign } from '~/helpers/jwt.helper';
import { findUser } from '~/repository/user.repository';
import { loginValidation } from '~/validations/authenticate.validation';
import { clearCookie, COOKIE_NAME } from '~/utils/cookie';
// Newest1 - Start
import { setUserLogTime } from '../user/users.service';
// Newest1 - End

export async function loginUser(email, password, res) {
  const validateResult = loginValidation({ email, password });
  if (validateResult.length) {
    return new ValidationError(
      validateResult.map((it) => it.message).join(','),
      {
        invalidArgs: validateResult.map((it) => it.field).join(','),
      },
    );
  }
  const user = await findUser({ email });
  if (!user) {
    clearCookie(res, COOKIE_NAME.TOKEN);
    return new AuthenticationError('Invalid email or password');
  }

  const matchPassword = await comparePassword(password, user.password);
  if (!matchPassword) {
    clearCookie(res, COOKIE_NAME.TOKEN);
    return new AuthenticationError('Invalid email or password');
  }

  // Newest1 - Start

  await setUserLogTime(user.id, new Date());

  // Newest1 - End

  return {
    token: sign({
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    }),
  };
}
