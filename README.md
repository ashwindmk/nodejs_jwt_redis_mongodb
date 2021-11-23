# Node Js JWT Redis MongoDB

Demo project.

### Generating random ID
```shell
node
require('crypto').randomBytes(64).toString('hex');
```

Press `^c ^c` to exit.

### Generate JWT access token
```javascript
...
    if (isUserValid(username, password)) {
        const payload = {
            sub: username,
            ...
        };
        const options = {
            expiresIn: process.env.JWT_ACCESS_TIME,
            ...
        }
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, options);
        ...
    }
```

### Verify JWT access token for protected routes
```javascript
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.userData = decoded;
        next();
    } atch (err) {
        // invalid token
    }
```

### JWT

- https://jwt.io/

### Redis

- https://redis.io/commands/set

### Run Server

1. Start mongo-db locally. Create userdb database.

2. Start redis locally.

3. Start the server using NPM
```shell
npm start
```
OR
```shell
npm run start:dev
```

### Test

**1. Register**
```curl
curl --location --request POST 'http://localhost:3000/api/v1/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "user1",
    "password": "pass1"
}'
```

**2. Login**
```curl
curl --location --request POST 'http://localhost:3000/api/v1/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username": "user1",
    "password": "pass1"
}'
```

Save the `access_token` and `refresh_token`.

**3. Access Dashboard Using Access-Token**
```curl
curl --location --request GET 'http://localhost:3000/api/v1/user/dashboard' \
--header 'Authorization: Bearer YOUR-ACCESS-TOKEN'
```

**4. After Access Token Expiration Refresh Token**
```curl
curl --location --request POST 'http://localhost:3000/api/v1/auth/token' \
--header 'Content-Type: application/json' \
--data-raw '{
    "token": "YOUR-REFRESH-TOKEN"
}'
```

Save the new `access_token` and `refresh_token`.
