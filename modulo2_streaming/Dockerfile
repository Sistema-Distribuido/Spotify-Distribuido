FROM golang:1.23-alpine AS build
WORKDIR /src
COPY . .
RUN go build -o app

FROM alpine:3.20
WORKDIR /app
COPY --from=build /src/app /app/app
EXPOSE 3002
CMD ["/app/app"]
