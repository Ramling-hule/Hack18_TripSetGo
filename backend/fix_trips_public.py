"""
One-time fix: Set is_public=True for all existing trips so they appear on the Discover feed.
Run from the backend directory: python fix_trips_public.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from app.database.session import SessionLocal
from app.models.trip import Trip

db = SessionLocal()
try:
    count = db.query(Trip).filter(Trip.is_public == False).update({"is_public": True})
    db.commit()
    print(f"✅ Updated {count} trip(s) to is_public=True")
finally:
    db.close()
