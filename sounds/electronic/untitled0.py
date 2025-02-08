import os
from pydub import AudioSegment

def increase_volume(folder_path, db_increase=1):
    for filename in os.listdir(folder_path):
        if filename.endswith(".wav"):
            file_path = os.path.join(folder_path, filename)
            audio = AudioSegment.from_wav(file_path)
            louder_audio = audio + db_increase
            new_filename = f"{filename}"
            new_file_path = os.path.join(folder_path, new_filename)
            louder_audio.export(new_file_path, format="wav")
            print(f"Processed: {filename} -> {new_filename}")

if __name__ == "__main__":
    folder_path = os.getcwd()  # Use current directory
    increase_volume(folder_path)
