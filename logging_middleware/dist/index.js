"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJrYXZpeWEucy4yMDIzLmFpbWxAcml0Y2hlbm5haS5lZHUuaW4iLCJleHAiOjE3NzgwNTAyMjMsImlhdCI6MTc3ODA0OTMyMywiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImNlMzI4YWRhLTJhNTMtNDY3Mi1iZDU0LTUzNmE0MzI0ZTc0OCIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6Imthdml5YSIsInN1YiI6Ijg2NzA0ZDc4LWQwNjktNDFjZi05MjMwLWI3ZGJhYmI2M2RlZCJ9LCJlbWFpbCI6Imthdml5YS5zLjIwMjMuYWltbEByaXRjaGVubmFpLmVkdS5pbiIsIm5hbWUiOiJrYXZpeWEiLCJyb2xsTm8iOiIyMTE3MjMwMDMwMDI4IiwiYWNjZXNzQ29kZSI6IkJUQ0RxVCIsImNsaWVudElEIjoiODY3MDRkNzgtZDA2OS00MWNmLTkyMzAtYjdkYmFiYjYzZGVkIiwiY2xpZW50U2VjcmV0Ijoia0JzdmRCVmtmcFNQaEFkbSJ9.560PqzsM4f2ARsRXRU3skMCWH8zAJCE92F3hudWb8sY";
const LOG_API = "http://20.207.122.201/evaluation-service/logs";
async function Log(stack, level, package_name, message) {
    try {
        const response = await fetch(LOG_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                stack,
                level,
                package: package_name,
                message
            })
        });
        const data = await response.json();
        console.log("Log sent:", data);
    }
    catch (error) {
        console.error("Logging failed:", error);
    }
}
