### ------------------------------------------------------------------------------
FROM node:22-alpine AS frontend-builder

RUN corepack enable

WORKDIR /app

COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY frontend/ ./
RUN pnpm build

### ------------------------------------------------------------------------------
FROM golang:1.25-alpine AS backend-builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY internal/ internal/
COPY cmd/ cmd/


COPY --from=frontend-builder /app/dist ./internal/infra/http/static/dist

RUN CGO_ENABLED=1 GOOS=linux go build ./cmd/server/main.go

### ------------------------------------------------------------------------------
FROM alpine:3.21

RUN apk add --no-cache ca-certificates tzdata

ENV TZ=Europe/London

WORKDIR /app

ENV ENV=production

COPY --from=backend-builder /app .

EXPOSE 9876

CMD ["./main"]
