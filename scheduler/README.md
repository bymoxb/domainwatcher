```bash
docker build -t bymoxb/dw-scheduler:1.2.0 .
```

```bash
docker tag bymoxb/dw-scheduler:1.2.0 bymoxb/dw-scheduler:latest
```

```bash
docker run \
  --rm \
  --env-file .env \
  --name dw-scheduler \
  bymoxb/dw-scheduler:latest
```
