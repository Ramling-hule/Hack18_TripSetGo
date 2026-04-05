"""
Fix existing trips: populate cost_per_person and cover_image for trips that lack them.
Run from backend directory: python fix_trip_data.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

# Must import all models BEFORE querying so SQLAlchemy resolves relationships
from app.models.user import User  # noqa
from app.models.email_otp import EmailOTP  # noqa
from app.models.refresh_token import RefreshToken  # noqa
from app.models.password_reset import PasswordReset  # noqa
from app.models.trip import Trip, TripLike, TripSave, TripComment, UserFollow  # noqa
from app.models.notification import Notification  # noqa

DESTINATION_IMAGES = {
    "goa": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
    "kerala": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
    "rajasthan": "https://images.unsplash.com/photo-1477587458883-47145ed31fd1?w=800",
    "jaipur": "https://images.unsplash.com/photo-1477587458883-47145ed31fd1?w=800",
    "manali": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    "paris": "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
    "bali": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800",
    "singapore": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
    "dubai": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    "mumbai": "https://images.unsplash.com/photo-1580581096469-7057e8564f8e?w=800",
    "delhi": "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800",
    "default": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
}

def get_cover_image(destination):
    if not destination:
        return DESTINATION_IMAGES["default"]
    dest_lower = destination.lower()
    for key in DESTINATION_IMAGES:
        if key in dest_lower:
            return DESTINATION_IMAGES[key]
    return DESTINATION_IMAGES["default"]


from app.database.session import SessionLocal

db = SessionLocal()
try:
    trips = db.query(Trip).all()
    updated = 0
    for trip in trips:
        changed = False

        # Fix cost_per_person
        if trip.cost_per_person is None:
            num = max(trip.num_travelers or 1, 1)
            total = None
            if trip.budget_summary and isinstance(trip.budget_summary, dict):
                total = trip.budget_summary.get("total_cost")
            if total:
                trip.cost_per_person = round(float(total) / num, 2)
            elif trip.budget:
                trip.cost_per_person = round(float(trip.budget) / num, 2)
            changed = True

        # Fix cover_image
        if not trip.cover_image:
            trip.cover_image = get_cover_image(trip.destination)
            changed = True

        if changed:
            updated += 1

    db.commit()
    print(f"✅ Fixed {updated} trip(s) — cost_per_person and cover_image populated")
finally:
    db.close()
