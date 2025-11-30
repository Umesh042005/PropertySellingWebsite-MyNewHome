# Step 1: Use official Java 20 JDK image
FROM eclipse-temurin:20-jdk-jammy

# Step 2: Set working directory inside the container
WORKDIR /app

# Step 3: Copy JAR file into the container
COPY target/property-selling-0.0.1-SNAPSHOT.jar app.jar

# Step 4: Set environment variables (optional default)
ENV DATASOURCE_URL=jdbc:postgresql://localhost:5432/propertydb
ENV DATASOURCE_USER=postgres
ENV DATASOURCE_PASSWORD=umesh
ENV FRONTEND_URL=http://localhost:3000

# Step 5: Expose port 8080
EXPOSE 8080

# Step 6: Run the JAR
ENTRYPOINT ["java","-jar","app.jar"]
