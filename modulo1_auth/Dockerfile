FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
COPY src ./src
RUN mvn -Djava.version=21 -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/*.jar /app/app.jar
EXPOSE 3001
ENTRYPOINT ["java","-jar","/app/app.jar","--server.port=3001"]
