-- One-time migration for databases created by older versions of the app.
-- New databases get the correct types automatically (spring.jpa.hibernate.ddl-auto=update).
-- Widens description so long / AI generated descriptions fit (non-destructive).
ALTER TABLE properties MODIFY description TEXT;
