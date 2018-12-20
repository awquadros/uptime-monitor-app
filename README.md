# uptime-monitor-app
Uptime Monitor app

## Gerar certificado

1. Baixar o OpenSSL
2. Colocar o OpenSSL no path
3. Navegar até a pasta https do projeto
4. usar o comando: openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem