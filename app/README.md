```bash
docker build -t bymoxb/dw-app:1.0.0 .
```

```bash
docker tag bymoxb/dw-app:1.0.0 bymoxb/dw-app:latest
```

```bash
docker run \
  --rm \
  --env-file .env \
  --name dw-app \
  -p 3000:3000  \
  bymoxb/dw-app:latest
```
