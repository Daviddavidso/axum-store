# Auth testing playbook (Emergent Google OAuth)

## Test User Setup
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'normuloli@gmail.com',
  name: 'Test Admin',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"

## Admin allowlist
- normuloli@gmail.com (env: ADMIN_EMAILS)

## API Tests
- GET /api/auth/me with cookie or Bearer token → user data
- GET /api/admin/products → 401 without auth, list of bilingual products with auth
- POST /api/admin/products with valid bilingual payload → 200
- PUT /api/admin/products/{id} → updates fields
- DELETE /api/admin/products/{id} → removes
- Hero & Lookbook same shape

## Browser
Set cookie `session_token` then navigate to /admin → should render dashboard (not redirect to login).

## Cleanup
db.users.deleteMany({email: /test\./});
db.user_sessions.deleteMany({session_token: /test_session/});
