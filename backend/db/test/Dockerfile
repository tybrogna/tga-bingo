FROM postgres:16-alpine

EXPOSE 6543
RUN echo "this is the test database"
COPY init.sql /docker-entrypoint-initdb.d/
# COPY backup-data.sql /docker-entrypoint-initdb.d/
