import { http, issueToken, MOCK_PASSWORD, MOCK_USER, withMock } from './helpers';

export const authHandlers = [
  http.post(
    '/auth/login',
    withMock(async ({ request, response }) => {
      const body = await request.json();
      if (body.username !== MOCK_USER.username || body.password !== MOCK_PASSWORD) {
        return response(401).json({
          success: false,
          errors: [{ field: 'password', message: 'Неверный логин или пароль' }],
        });
      }

      const { token, expires_at } = issueToken();
      return response(200).json({
        success: true,
        data: {
          token,
          expires_at,
          user: { id: MOCK_USER.id, username: MOCK_USER.username, role: MOCK_USER.role },
        },
      });
    }),
  ),
];
