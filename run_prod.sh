#!/usr/bin/env bash
set -euo pipefail

# Simple production run script for local / simple deployments.
# - Starts the Flask backend using gunicorn inside server/.venv
# - Builds the frontend and serves it with `vite preview`
# - Writes PID files and logs to a `logs/` directory

BACKEND_DIR="server"
FRONTEND_DIR="web"
BACKEND_VENV="$BACKEND_DIR/.venv"
PORT="${PORT:-5060}"
WEB_PORT="${WEB_PORT:-5160}"
WORKERS="${WORKERS:-3}"
LOG_DIR="logs"

mkdir -p "$LOG_DIR"

echo "Using backend venv: $BACKEND_VENV"

# helper: check if pid file exists and process is running
is_running() {
  local pidfile="$1"
  if [ -f "$pidfile" ]; then
    local pid
    pid=$(cat "$pidfile" 2>/dev/null || echo "")
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "$pid"
      return 0
    fi
  fi
  return 1
}

# graceful stop helper
stop_pidfile() {
  local pidfile="$1"
  local name="$2"
  if pid=$(is_running "$pidfile"); then
    echo "Stopping $name (PID $pid)..."
    kill -TERM "$pid" || true
    # wait up to 10s for process to exit
    for i in {1..10}; do
      if ! kill -0 "$pid" 2>/dev/null; then
        break
      fi
      sleep 1
    done
    if kill -0 "$pid" 2>/dev/null; then
      echo "$name did not exit, sending KILL"
      kill -KILL "$pid" || true
      sleep 1
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
      echo "$name stopped"
      rm -f "$pidfile" || true
      return 0
    else
      echo "Failed to stop $name (PID $pid)"
      return 2
    fi
  else
    # remove stale pidfile if present
    if [ -f "$pidfile" ]; then
      echo "Removing stale pidfile $pidfile"
      rm -f "$pidfile"
    fi
    return 0
  fi
}

if [ ! -f "$BACKEND_VENV/bin/activate" ]; then
  echo "Virtualenv not found. Creating $BACKEND_VENV..."
  python3 -m venv "$BACKEND_VENV"
  "$BACKEND_VENV/bin/python" -m pip install --upgrade pip
  echo "Installing backend requirements..."
  "$BACKEND_VENV/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
fi

if [ ! -x "$BACKEND_VENV/bin/gunicorn" ]; then
  echo "gunicorn not found in venv. Installing gunicorn..."
  "$BACKEND_VENV/bin/pip" install gunicorn
fi

# If there are existing prod processes, stop them first
echo "Checking for existing production processes..."
stop_pidfile "$BACKEND_DIR/gunicorn.pid" "backend" || echo "Warning: backend stop returned non-zero"
stop_pidfile "$FRONTEND_DIR/preview.pid" "frontend" || echo "Warning: frontend stop returned non-zero"

# Also kill any orphaned vite preview processes for this project
echo "Cleaning up any orphaned vite preview processes..."
pkill -f "theSimulation/web.*vite preview" || true
sleep 1

echo "Starting backend with gunicorn on 0.0.0.0:$PORT (workers=$WORKERS)"
nohup "$BACKEND_VENV/bin/gunicorn" -w "$WORKERS" -b "0.0.0.0:$PORT" --timeout 120 server.app:app --log-level info > "$LOG_DIR/backend.log" 2>&1 &
echo $! > "$BACKEND_DIR/gunicorn.pid"

# Frontend: ensure dependencies, build, then preview
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Installing frontend dependencies (this may take a moment)..."
  (cd "$FRONTEND_DIR" && npm install)
fi

echo "Building frontend..."
(cd "$FRONTEND_DIR" && npm run build)

echo "Starting frontend preview on port $WEB_PORT"
# Run vite from the web directory so it can find dist/
cd "$FRONTEND_DIR"
nohup ./node_modules/.bin/vite preview > "../$LOG_DIR/frontend.log" 2>&1 &
VITE_PID=$!
echo $VITE_PID > "preview.pid"
cd ..

echo "---"
echo "Production run started"
echo "Backend: http://0.0.0.0:$PORT (PID $(cat $BACKEND_DIR/gunicorn.pid))"
echo "Frontend: http://0.0.0.0:$WEB_PORT (PID $(cat $FRONTEND_DIR/preview.pid))"
echo "Logs: $LOG_DIR/backend.log, $LOG_DIR/frontend.log"

echo "To stop: kill \\$(cat $BACKEND_DIR/gunicorn.pid) \\$(cat $FRONTEND_DIR/preview.pid)"

exit 0
