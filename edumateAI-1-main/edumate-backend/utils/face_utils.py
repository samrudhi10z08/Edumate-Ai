import base64
import cv2
import numpy as np
import mediapipe as mp

mp_face = mp.solutions.face_mesh

def get_face_embedding(base64_image):
    try:
        # Remove base64 header
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]

        # Decode image
        image_bytes = base64.b64decode(base64_image)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            print("Image decode failed")
            return None

        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        with mp_face.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True
        ) as face_mesh:

            result = face_mesh.process(img_rgb)

            if not result.multi_face_landmarks:
                print("No face detected")
                return None

            landmarks = result.multi_face_landmarks[0]

            # Convert landmarks to numerical embedding
            embedding = []
            for lm in landmarks.landmark:
                embedding.extend([lm.x, lm.y, lm.z])

            return np.array(embedding, dtype=np.float32)

    except Exception as e:
        print("MediaPipe error:", e)
        return None
