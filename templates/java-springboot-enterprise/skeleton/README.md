# ${{ values.name }}

${{ values.description }}

This repository was generated using the **Java Spring Boot Enterprise Application** template from the Internal Developer Portal.

---

## 🚀 Getting Started

### Prerequisites
- **JDK ${{ values.javaVersion | default('17') }}+** installed
- **Apache Maven 3.8+** (or use the Maven Wrapper)

### Run Locally
```bash
# Build the application
mvn clean package

# Run the Spring Boot application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/hello` | Health & welcome message |
| `GET` | `/actuator/health` | Spring Boot health check |
| `GET` | `/actuator/metrics` | Spring Boot metrics |

---

## 🧪 Testing

```bash
mvn test
```

---

## ⚙️ CI/CD Pipeline
This repository includes a GitHub Actions workflow in `.github/workflows/ci.yml` that automatically builds and tests your application on every push and pull request to `main`.
