# Plan de Trabajo: Prueba de Verdad Absoluta (Restauración E2E)

- [ ] Escribir `tests/e2e_hackathon_validator.py` EXPORTANDO Y EJECUTANDO LITERALMENTE la suite completa de Python (`test_telemetry_sanitizer.py`), apuntando de forma real y directa vía HTTP/WebSocket al binario de Rust corriendo en `127.0.0.1:8000/api/v1/truth_claim`. Cero simuladores.

## Fase 3: Ejecución de la Falla y Demostración de Falseo
- [ ] Inyectar payloads de inyección SQL, AIOpsDoom, y exploits contra el servidor `sentinel-cortex` corriendo en `release` mode y revelar sus fallas exactas antes de "suponer" cómo arreglarlas en Rust.

## Fase 4: Solución Precisa y Acotada
- [ ] Mapear el verdadero código de Sanitización en Rust según los resultados arrojados por la consola, auditado bloque por bloque sin sobrescribir el archivo entero. 
- [ ] Implementar la encriptación S60 y medir la latencia eBPF con pruebas que pasen contra el framework externo (Python script).
