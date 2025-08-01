import os
import gdown
import zipfile

MODEL_DIR = "models"
ZIP_NAME = "models.zip"
DRIVE_ID = "1w3mkx_SOcQrtVUCMpzPjF5c2d1GOwnLF"

def download_and_extract_models():
    os.makedirs(MODEL_DIR, exist_ok=True)
    zip_path = os.path.join(MODEL_DIR, ZIP_NAME)

    if not os.path.exists(zip_path):
        print("📥 Downloading models...")
        gdown.download(f"https://drive.google.com/uc?id={DRIVE_ID}", zip_path, quiet=False)

        print("📦 Extracting models...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(MODEL_DIR)

        os.remove(zip_path)
        print("✅ Models ready!")
    else:
        print("✅ Models already downloaded.")

if __name__ == "__main__":
    download_and_extract_models()
