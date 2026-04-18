from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
import pytesseract
from PIL import Image
import io
import base64
import PyPDF2
import re
import os
import logging
from datetime import datetime
from bson.objectid import ObjectId
from middlewares.auth_middleware import token_required
from difflib import SequenceMatcher

ocr_bp = Blueprint("ocr", __name__)
logger = logging.getLogger(__name__)

# Performance model subjects - subjects to extract marks for
EXPECTED_SUBJECTS = [
    'Systems in mechanical engg',
    'Basic electrical engg',
    'Engineering Physics',
    'Programming & Problem solving',
    'Engg Mathematics - I',
    'Engineering Mechanics',
    'Basic electronics engineering',
    'Engg Chemistry',
    'Engg Graphics',
    'Engg Mathematics II',
    'Fundamentals of Programming Languages'
]

# Create a set of lowercase subject names for quick lookup
EXPECTED_SUBJECTS_LOWER = [s.lower().strip() for s in EXPECTED_SUBJECTS]

# Configure Tesseract path for Windows
TESSERACT_PATH = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.pytesseract_cmd = TESSERACT_PATH
    logger.info(f"Tesseract configured at: {TESSERACT_PATH}")
else:
    logger.warning(f"Tesseract not found at {TESSERACT_PATH}. OCR functionality may be limited.")

# Check if Tesseract is available
def is_tesseract_available():
    try:
        pytesseract.get_tesseract_version()
        return True
    except Exception as e:
        logger.warning(f"Tesseract not available: {e}")
        return False

def find_best_subject_match(text, threshold=0.6):
    """
    Find the best matching subject from performance model subjects
    using fuzzy string matching (SequenceMatcher)
    
    Args:
        text (str): The text to match against expected subjects
        threshold (float): Minimum similarity ratio (0-1)
    
    Returns:
        str: The matched subject name from EXPECTED_SUBJECTS, or None if no match above threshold
    """
    text_lower = text.lower().strip()
    
    best_match = None
    best_ratio = threshold
    
    for subject in EXPECTED_SUBJECTS:
        subject_lower = subject.lower().strip()
        
        # Check for exact match first
        if text_lower == subject_lower:
            return subject
        
        # Check if subject is contained in text or text in subject
        if subject_lower in text_lower or text_lower in subject_lower:
            ratio = SequenceMatcher(None, text_lower, subject_lower).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = subject
        else:
            # Use sequence matcher for fuzzy matching
            ratio = SequenceMatcher(None, text_lower, subject_lower).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = subject
    
    logger.debug(f"Subject match: '{text}' -> '{best_match}' (ratio: {best_ratio})")
    return best_match

@ocr_bp.route("/status", methods=["GET"])
@cross_origin()
def ocr_status():
    """
    Check OCR system status (no authentication required)
    Returns availability of OCR components
    """
    try:
        tesseract_available = is_tesseract_available()
        
        # Check if pdf2image is available
        try:
            import pdf2image
            pdf2image_available = True
        except ImportError:
            pdf2image_available = False
        
        return jsonify({
            "success": True,
            "tesseract_available": tesseract_available,
            "pdf2image_available": pdf2image_available,
            "ocr_capable": tesseract_available,  # Can do OCR if Tesseract available
            "pdf_capable": pdf2image_available,  # Can process PDFs if pdf2image available
            "message": "Image upload supported. " + (
                "PDF scanning supported." if (tesseract_available and pdf2image_available) 
                else "PDF scanning not fully supported - use image upload instead."
            )
        }), 200
    except Exception as e:
        logger.error(f"OCR status check error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@ocr_bp.route("/expected-subjects", methods=["GET"])
@cross_origin()
def get_expected_subjects():
    """
    Get list of subjects that OCR will extract
    No authentication required - used by frontend for UI
    """
    return jsonify({
        "success": True,
        "subjects": EXPECTED_SUBJECTS
    }), 200


@ocr_bp.route("/extract-text", methods=["POST"])
@cross_origin()
@token_required
def extract_text():
    """
    Extract text from uploaded image or PDF file with OCR
    Extracts ONLY marks for subjects in the performance model

    """
    try:
        extracted_text = ""
        
        # Handle file upload
        if 'file' in request.files:
            file = request.files['file']
            if file.filename == '':
                return jsonify({"error": "No file selected", "success": False}), 400
            
            # Read file based on extension
            filename = file.filename.lower()
            file_bytes = file.read()
            
            if filename.endswith(('.pdf',)):
                # Extract text from PDF
                try:
                    extracted_text = extract_text_from_pdf(file_bytes)
                except ValueError as e:
                    return jsonify({
                        "error": str(e),
                        "success": False,
                        "suggestion": "Try uploading a JPG or PNG image of your marksheet instead, or use manual entry"
                    }), 400
                except Exception as e:
                    logger.error(f"PDF extraction error: {e}")
                    return jsonify({
                        "error": f"PDF processing error. Please try a JPG/PNG image instead.",
                        "success": False,
                        "suggestion": "Try uploading a JPG or PNG image of your marksheet"
                    }), 400
            
            elif filename.endswith(('.png', '.jpg', '.jpeg')):
                # Process image with OCR
                try:
                    if not is_tesseract_available():
                        return jsonify({
                            "error": "OCR is not available. Please use manual entry.",
                            "success": False,
                            "suggestion": "Use manual entry mode to enter your marks"
                        }), 503
                    
                    image = Image.open(io.BytesIO(file_bytes))
                    extracted_text = pytesseract.image_to_string(image, lang='eng')
                except Exception as e:
                    logger.error(f"Image OCR error: {e}")
                    return jsonify({
                        "error": f"Failed to process image. Please try a clearer image.",
                        "success": False,
                        "suggestion": "Try uploading a clearer/higher resolution image"
                    }), 400
            else:
                return jsonify({"error": "Unsupported file format. Use PDF, PNG, or JPG", "success": False}), 400
        
        # Handle base64 encoded image
        elif request.is_json and 'image' in request.get_json():
            base64_image = request.get_json().get('image')
            try:
                if not is_tesseract_available():
                    return jsonify({
                        "error": "OCR is not available",
                        "success": False
                    }), 503
                
                image_bytes = base64.b64decode(base64_image.split(',')[1] if ',' in base64_image else base64_image)
                image = Image.open(io.BytesIO(image_bytes))
                extracted_text = pytesseract.image_to_string(image, lang='eng')
            except Exception as e:
                logger.error(f"Base64 image OCR error: {e}")
                return jsonify({
                    "error": f"Failed to process image",
                    "success": False
                }), 400
        
        else:
            return jsonify({"error": "No file or image provided", "success": False}), 400
        
        if not extracted_text or extracted_text.strip() == "":
            return jsonify({
                "error": "No text could be extracted from the file",
                "success": False,
                "suggestion": "The file may be unclear. Try uploading a different image or use manual entry"
            }), 400
        
        # Parse marks from extracted text (ONLY for performance model subjects)
        marks_data = parse_marks(extracted_text)
        
        if not marks_data:
            return jsonify({
                "error": "No marks matched to known subjects",
                "success": False,
                "suggestion": "Use manual entry to enter your marks"
            }), 400
        
        # Get user_id from the token
        user_id = request.user.get("user_id")
        
        # Save marks to database
        saved_marks = save_marks_to_db(user_id, marks_data)
        
        return jsonify({
            "success": True,
            "raw_text": extracted_text,
            "marks": marks_data,
            "saved_marks_count": len(saved_marks),
            "expected_subjects": EXPECTED_SUBJECTS,
            "matched_subjects": [m["subject"] for m in marks_data],
            "message": f"Successfully extracted {len(saved_marks)} marks"
        }), 200
    
    except Exception as e:
        logger.error(f"Extract text error: {e}", exc_info=True)
        return jsonify({
            "error": str(e),
            "success": False,
            "suggestion": "Use manual entry to enter your marks"
        }), 500


@ocr_bp.route("/get-marks", methods=["GET"])
@cross_origin()
@token_required
def get_marks():
    """
    Retrieve all marks for the authenticated user from database
    """
    try:
        user_id = request.user.get("user_id")
        
        # Convert user_id string to ObjectId
        try:
            user_oid = ObjectId(user_id)
        except Exception as e:
            logger.error(f"Invalid user_id format: {user_id}, {e}")
            return jsonify({"error": "Invalid user ID", "success": False}), 400
        
        marks_collection = current_app.mongo.db.marks
        
        # Query marks for this user
        user_marks = list(marks_collection.find({"user_id": user_oid}).sort("uploaded_at", -1))
        
        # Convert ObjectId to string for JSON serialization
        for mark in user_marks:
            mark["_id"] = str(mark["_id"])
            mark["user_id"] = str(mark["user_id"])
            mark["uploaded_at"] = mark["uploaded_at"].isoformat() if mark.get("uploaded_at") else None
        
        return jsonify({
            "success": True,
            "marks": user_marks,
            "total_marks": len(user_marks)
        }), 200
        
    except Exception as e:
        logger.error(f"Error retrieving marks: {e}", exc_info=True)
        return jsonify({"error": str(e), "success": False}), 500


def extract_text_from_pdf(pdf_bytes):
    """
    Extract text from PDF using PyPDF2, with OCR fallback for scanned PDFs
    Handles both text-based PDFs and scanned image PDFs
    """
    extracted_text = ""
    
    try:
        # First, try PyPDF2 text extraction
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
            
            # Extract text from all pages
            for page_num in range(len(pdf_reader.pages)):
                try:
                    page = pdf_reader.pages[page_num]
                    text = page.extract_text()
                    if text and text.strip():
                        extracted_text += text + "\n"
                except Exception as e:
                    logger.warning(f"Error extracting text from page {page_num}: {e}")
                    continue
            
            # If we got text, return it
            if extracted_text.strip():
                logger.info("Successfully extracted text from PDF using PyPDF2")
                return extracted_text
        
        except Exception as e:
            logger.warning(f"PyPDF2 extraction failed or returned empty: {e}")
        
        # Fallback: Use OCR on PDF pages (for scanned PDFs)
        logger.info("Attempting OCR-based extraction for scanned PDF")
        
        # Check if we have the required dependencies
        try:
            from pdf2image import convert_from_bytes
            if not is_tesseract_available():
                raise ValueError("Tesseract OCR is not installed. Cannot process scanned PDFs.")
        except ImportError:
            raise ValueError("pdf2image is not installed. Cannot process scanned PDFs. Try uploading a PNG or JPG instead.")
        
        extracted_text = extract_text_from_pdf_with_ocr(pdf_bytes)
        
        if extracted_text.strip():
            logger.info("Successfully extracted text from PDF using OCR")
            return extracted_text
        else:
            raise ValueError("Could not extract text from PDF - the document may be corrupted or contain no readable text")
    
    except ValueError:
        raise
    except Exception as e:
        logger.error(f"PDF reading error: {e}")
        raise ValueError(f"Failed to read PDF: {str(e)}")


def extract_text_from_pdf_with_ocr(pdf_bytes):
    """
    Extract text from PDF pages using OCR (for scanned PDFs)
    Converts each PDF page to an image and runs Tesseract OCR
    """
    try:
        from pdf2image import convert_from_bytes
    except ImportError:
        logger.error("pdf2image not installed - cannot process scanned PDFs")
        return ""
    
    try:
        extracted_text = ""
        
        # Convert PDF pages to images
        images = convert_from_bytes(pdf_bytes, dpi=200)
        logger.info(f"Converted PDF to {len(images)} page images")
        
        # Run OCR on each page image
        for page_num, image in enumerate(images):
            try:
                text = pytesseract.image_to_string(image, lang='eng')
                if text and text.strip():
                    extracted_text += text + "\n"
                logger.debug(f"OCR extracted text from page {page_num + 1}")
            except Exception as e:
                logger.warning(f"OCR failed on page {page_num + 1}: {e}")
                continue
        
        return extracted_text
    
    except Exception as e:
        logger.error(f"PDF to image conversion error: {e}")
        return ""


def parse_marks(text):
    """
    Parse OCR extracted text to extract subject names and grades/marks
    ONLY extracts marks for subjects mentioned in the performance model
    
    Handles multiple formats:
    - "Math 85" or "Math: 85"
    - "English A+" or "Science O"
    - "History 92 (A+)"
    - University table format: "414441	INFO & STORAGE RETRIEVAL	* TH	3	3	A+	27"
    """
    lines = text.split('\n')
    marks = []
    seen_subjects = set()
    
    # Valid grades
    valid_grades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'P', 'F']
    
    for line in lines:
        line = line.strip()
        if not line or len(line) < 3:
            continue
        
        # Try to parse the line for subject and mark/grade
        result = parse_line_for_marks(line, valid_grades)
        if result:
            subject_text, grade, marks_num = result
            
            # Find the best matching subject from performance model
            matched_subject = find_best_subject_match(subject_text, threshold=0.55)
            
            if matched_subject:
                # Avoid duplicates
                subject_key = matched_subject.lower().strip()
                if subject_key not in seen_subjects:
                    marks.append({
                        "subject": matched_subject,
                        "grade": grade,
                        "marks": marks_num
                    })
                    seen_subjects.add(subject_key)
                    logger.info(f"Extracted: '{subject_text}' -> '{matched_subject}' ({grade})")
            else:
                logger.debug(f"Subject '{subject_text}' does not match any performance model subject")
    
    logger.info(f"Parse marks extracted {len(marks)} marks for performance model subjects from text")
    return marks


def parse_line_for_marks(line, valid_grades):
    """
    Parse a single line to extract subject, grade, and marks
    Returns: (subject, grade, marks) tuple or None
    
    Handles:
    1. Simple format: "Mathematics 92" or "Math: 95"
    2. Letter grades: "Math O" or "English A+"
    3. University table format with tabs/spaces:
       "414441	INFO & STORAGE RETRIEVAL	* TH	3	3	A+	27"
    """
    
    try:
        # Remove extra whitespace but preserve structure
        cleaned_line = re.sub(r'\s+', ' ', line)
        
        # Check if line contains a valid grade
        found_grade = None
        for grade in ['A+', 'O', 'A', 'B+', 'B', 'C', 'D', 'P', 'F']:
            if f' {grade} ' in cleaned_line or f' {grade}' in cleaned_line[-10:]:
                found_grade = grade
                break
        
        if found_grade:
            # Try to extract subject name (usually before or near the grade)
            # For university format: "414441 INFO & STORAGE RETRIEVAL * TH 3 3 A+ 27"
            parts = cleaned_line.split()
            
            # Find position of grade in parts
            grade_idx = -1
            for i, part in enumerate(parts):
                if part == found_grade:
                    grade_idx = i
                    break
            
            if grade_idx > 0:
                # Subject is typically the longer text before the grade
                # Skip course code (usually first numeric part) and type indicators
                subject_parts = []
                
                for i in range(len(parts)):
                    part = parts[i]
                    
                    # Skip course codes (numbers only), type indicators (* TH, * AC, etc.)
                    if part.isdigit() or part.startswith('*') or part in ['TH', 'P', 'PR', 'AC', 'TV', 'OR', '']:
                        continue
                    
                    # Stop before grade
                    if part == found_grade:
                        break
                    
                    # Include this part in subject
                    if len(part) > 1 and not part.isdigit():
                        subject_parts.append(part)
                
                if subject_parts:
                    subject = ' '.join(subject_parts)
                    
                    if subject and len(subject) > 1 and not subject.isdigit():
                        # Try to extract marks if present after grade
                        marks_num = None
                        if grade_idx + 1 < len(parts):
                            try:
                                marks_num = int(parts[grade_idx + 1])
                            except ValueError:
                                pass
                        
                        logger.debug(f"Parsed: subject='{subject}', grade='{found_grade}', marks={marks_num}")
                        return (subject, found_grade, marks_num)
        
        # If grade not found, try numeric marks format
        match = re.search(r'(.+?)[\s:,\-](\d{1,3})(?:\s|$|%)', cleaned_line)
        if match:
            subject = match.group(1).strip()
            marks_str = match.group(2)
            
            if subject and len(subject) > 1 and not subject.isdigit():
                try:
                    marks_num = int(marks_str)
                    if 0 <= marks_num <= 100:
                        grade = mark_to_grade(marks_num)
                        logger.debug(f"Parsed numeric: subject='{subject}', marks={marks_num}, grade='{grade}'")
                        return (subject, grade, marks_num)
                except ValueError:
                    pass
        
        return None
    except Exception as e:
        logger.error(f"Error parsing line: {line}, {e}")
        return None


def mark_to_grade(mark):
    """Convert numeric marks to grade"""
    if mark >= 90:
        return 'O'
    elif mark >= 80:
        return 'A+'
    elif mark >= 70:
        return 'A'
    elif mark >= 60:
        return 'B+'
    elif mark >= 50:
        return 'B'
    elif mark >= 40:
        return 'C'
    elif mark >= 35:
        return 'D'
    elif mark >= 30:
        return 'P'
    else:
        return 'F'


def save_marks_to_db(user_id, marks_data):
    """
    Save extracted marks to MongoDB database
    
    Args:
        user_id (str): The user's ID from the JWT token
        marks_data (list): List of marks dictionaries with subject, grade, marks
        
    Returns:
        list: List of saved mark documents with their IDs
    """
    try:
        if not user_id or not marks_data:
            logger.warning(f"Invalid input: user_id={user_id}, marks_data={marks_data}")
            return []
        
        # Convert user_id string to ObjectId if needed
        try:
            user_oid = ObjectId(user_id)
        except Exception as e:
            logger.error(f"Invalid user_id format: {user_id}, {e}")
            return []
        
        marks_collection = current_app.mongo.db.marks
        
        saved_marks = []
        
        for mark in marks_data:
            try:
                # Create mark document with user reference and timestamp
                mark_doc = {
                    "user_id": user_oid,
                    "subject": mark.get("subject", ""),
                    "grade": mark.get("grade", ""),
                    "marks": mark.get("marks"),
                    "uploaded_at": datetime.utcnow()
                }
                
                # Insert the mark document
                result = marks_collection.insert_one(mark_doc)
                
                # Add the inserted ID to the response
                mark_doc["_id"] = str(result.inserted_id)
                saved_marks.append(mark_doc)
                
                logger.info(f"Mark saved for user {user_id}: {mark.get('subject')} - {mark.get('grade')}")
                
            except Exception as e:
                logger.error(f"Error saving individual mark: {mark}, {e}")
                continue
        
        logger.info(f"Successfully saved {len(saved_marks)} marks for user {user_id}")
        return saved_marks
        
    except Exception as e:
        logger.error(f"Error saving marks to database: {e}", exc_info=True)
        return []
