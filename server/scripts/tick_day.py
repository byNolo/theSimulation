#!/usr/bin/env python3
"""Tick the simulation day boundary.

This script finalizes the previous EST day (if not already finalized)
and ensures the current EST day exists. Designed to be invoked by cron
or a systemd timer at midnight EST (or equivalent UTC time).
"""
import sys
from zoneinfo import ZoneInfo
from datetime import datetime, date, timedelta
import logging
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from server import create_app
from server.db import db
from server.models import Day
from server.routes.api import finalize_day, ensure_today

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def est_today():
    return datetime.now(ZoneInfo('America/New_York')).date()


def run_tick():
    app = create_app()
    with app.app_context():
        today = est_today()
        yesterday = today - timedelta(days=1)

        # Try to finalize yesterday if it exists and hasn't been finalized
        day_y = Day.query.filter_by(est_date=yesterday).first()
        if day_y:
            logger.info(f"Attempting finalize_day for {day_y.id} ({yesterday})")
            try:
                finalize_day(day_y)
            except Exception as e:
                logger.exception(f"Error finalizing day {day_y.id}: {e}")
        else:
            logger.info(f"No Day row for yesterday ({yesterday}) - skipping finalize")

        # Ensure today exists (this will create the new day and send vote reminders)
        try:
            d = ensure_today()
            logger.info(f"ensure_today returned day {d.id} ({d.est_date})")
        except Exception as e:
            logger.exception(f"Error ensuring today: {e}")


if __name__ == '__main__':
    run_tick()
