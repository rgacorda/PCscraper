# 🔗 API Module

The API routes provide structured access to the scraped PC part data.

---

## 📍 Endpoints

| Method | Endpoint | Description |
|---------|-----------|-------------|
| `GET` | `/api/parts` | Get all PC parts |
| `GET` | `/api/parts?category=cpu` | Filter by category |
| `POST` | `/api/scrape` | Trigger data scraping |
| `GET` | `/api/categories` | List all available categories |

---

## 🧱 Example Response
```json
{
  "id": "cpu-ryzen-5600",
  "name": "AMD Ryzen 5 5600",
  "price": 7899,
  "store": "PCWorth",
  "stock": true,
  "url": "https://pcworth.ph/amd-ryzen-5600"
}
```
