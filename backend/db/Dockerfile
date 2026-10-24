FROM postgres:16-alpine

EXPOSE 5432
RUN echo "hello from the real database"
COPY init.sql /docker-entrypoint-initdb.d/
