FROM ubuntu:20.04

WORKDIR /usr/src/auth0tenant-service

COPY dist/auth0-tenant-service .

EXPOSE 8000

ENTRYPOINT [ "./auth0-tenant-service" ]
