# ${{ values.name }}

${{ values.description }}

This repository was generated using the **.NET Web API Enterprise Application** template from the Internal Developer Portal.

---

## 🚀 Getting Started

### Prerequisites
- **.NET ${{ values.dotnetVersion | default('net8.0') }} SDK** installed

### Run Locally
```bash
# Restore dependencies
dotnet restore

# Run the Web API
dotnet run
```

The application will start on `https://localhost:7001` or `http://localhost:5000`.

---

## 📡 API Endpoints & Swagger

* **Swagger UI:** `http://localhost:5000/swagger` (in Development mode)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Health & service status check |
| `GET` | `/WeatherForecast` | Sample forecast endpoint |

---

## 🧪 Testing

```bash
dotnet test
```

---

## ⚙️ CI/CD Pipeline
This repository includes a GitHub Actions workflow in `.github/workflows/ci.yml` that automatically builds and tests your application on every push and pull request to `main`.
