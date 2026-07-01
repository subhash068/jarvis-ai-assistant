import logging
import random
from pydantic import BaseModel
from typing import List

logger = logging.getLogger(__name__)

class DocumentIntelligenceResult(BaseModel):
    filename: str
    file_type: str
    metadata_author: str
    metadata_creation_date: str
    extracted_emails: List[str]
    extracted_phones: List[str]
    hidden_urls: List[str]

class ImageIntelligenceResult(BaseModel):
    filename: str
    exif_camera_model: str
    exif_date: str
    gps_location: str
    detected_objects: List[str]
    face_count: int

async def analyze_document(filename: str) -> DocumentIntelligenceResult:
    logger.info(f"Analyzing document: {filename}")
    
    seed = sum(ord(c) for c in filename)
    random.seed(seed)
    
    return DocumentIntelligenceResult(
        filename=filename,
        file_type=filename.split('.')[-1] if '.' in filename else "unknown",
        metadata_author=random.choice(["Unknown", "John Doe", "Admin", "User123"]),
        metadata_creation_date=f"202{random.randint(0,4)}-0{random.randint(1,9)}-1{random.randint(0,9)}",
        extracted_emails=["contact@example.com"] if random.choice([True, False]) else [],
        extracted_phones=["+1 555-0100"] if random.choice([True, False]) else [],
        hidden_urls=["http://suspicious-link.com"] if random.choice([True, False, False]) else []
    )

async def analyze_image(filename: str) -> ImageIntelligenceResult:
    logger.info(f"Analyzing image: {filename}")
    
    seed = sum(ord(c) for c in filename)
    random.seed(seed)
    
    objects = ["Car", "Person", "Building", "Tree", "Computer", "Dog"]
    
    return ImageIntelligenceResult(
        filename=filename,
        exif_camera_model=random.choice(["iPhone 13", "Samsung Galaxy S22", "Canon EOS R5", "Unknown"]),
        exif_date=f"202{random.randint(0,4)}-0{random.randint(1,9)}-1{random.randint(0,9)}",
        gps_location=random.choice(["37.7749° N, 122.4194° W", "40.7128° N, 74.0060° W", "Unknown"]),
        detected_objects=random.sample(objects, random.randint(1, 4)),
        face_count=random.randint(0, 5)
    )
