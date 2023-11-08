#!/bin/bash
echo ">> Velog Dashboard Project Docker Init"
docker compose -f docker-compose.yml -p velog-dashboard stop
docker compose -f docker-compose.yml -p velog-dashboard down
docker compose -f docker-compose.yml -p velog-dashboard up -d

sleep 1
docker compose -f docker-compose.yml -p velog-dashboard logs -f