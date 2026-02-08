```bash
docker build -t bymoxb/dw-scheduler:1.1.0 .
```

```bash
docker tag bymoxb/dw-scheduler:1.1.0 bymoxb/dw-scheduler:latest
```

```bash
docker run \
  --rm \
  -e TZ="Europe/London" \
  -e DATABASE_URL="" \
  -e MAIL_PORT="2525" \
  -e MAIL_HOST="" \
  -e MAIL_USER="" \
  -e MAIL_PASSWORD="" \
  -e MAIL_FROM="" \
  -e DW_EXPIRATION_THRESHOLD="15" \
  --name dw-scheduler \
  bymoxb/dw-scheduler:1.1.0
```
