# Services

This directory is for additional microservices in different languages.

## Adding a Python Service

Example structure for a Python service:

```bash
services/python-service/
├── requirements.txt
├── Dockerfile
├── main.py
└── README.md
```

Example `requirements.txt`:
```
fastapi==0.104.1
uvicorn==0.24.0
```

Example `main.py`:
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "python-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Adding a Go Service

Example structure for a Go service:

```bash
services/go-service/
├── go.mod
├── go.sum
├── Dockerfile
├── main.go
└── README.md
```

Example `go.mod`:
```go
module github.com/volcabulary/go-service

go 1.21

require github.com/gin-gonic/gin v1.9.1
```

Example `main.go`:
```go
package main

import (
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    r.GET("/health", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "status": "ok",
            "service": "go-service",
        })
    })

    r.Run(":8080")
}
```

## Communication Between Services

Services can communicate via:
- HTTP/REST APIs
- gRPC
- Message queues (RabbitMQ, Kafka)
- Shared database
- Event streaming
