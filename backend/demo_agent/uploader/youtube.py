import os
import json
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

SCOPES = ['https://www.googleapis.com/auth/youtube.upload']

class YouTubeUploader:
    def __init__(self, credentials_path: str = "demo_agent/config/client_secrets.json"):
        self.credentials_path = credentials_path
        self.youtube = None

    def authenticate(self):
        """
        Authenticates with YouTube API using OAuth 2.0.
        Expects a client_secrets.json file from Google Cloud Console.
        """
        creds = None
        token_path = "demo_agent/config/token.json"
        
        # Load existing token if available
        if os.path.exists(token_path):
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
            
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(self.credentials_path):
                    print(f"Error: Missing {self.credentials_path}. Please download it from GCP.")
                    return False
                    
                flow = InstalledAppFlow.from_client_secrets_file(self.credentials_path, SCOPES)
                creds = flow.run_local_server(port=0)
                
            # Save the credentials for the next run
            os.makedirs(os.path.dirname(token_path), exist_ok=True)
            with open(token_path, 'w') as token:
                token.write(creds.to_json())

        self.youtube = build('youtube', 'v3', credentials=creds)
        return True
        
    def generate_metadata(self, demo_plan_title: str, demo_plan_desc: str):
        """
        Uses an LLM to generate SEO-friendly title, description, and tags.
        (For now, we statically generate it based on the plan).
        """
        metadata = {
            "title": f"Demo: {demo_plan_title}",
            "description": f"{demo_plan_desc}\n\nGenerated autonomously by Jarvis AI.",
            "tags": ["AI", "Demo", "Automation", "Jarvis"],
            "categoryId": "22" # People & Blogs
        }
        return metadata

    def upload(self, video_path: str, metadata: dict, privacy_status="private"):
        """
        Uses the YouTube Data API to upload the video.
        """
        if not self.youtube:
            if not self.authenticate():
                print("Failed to authenticate with YouTube API. Skipping upload.")
                return

        print(f"Uploading {video_path} to YouTube...")
        
        try:
            body = {
                'snippet': {
                    'title': metadata.get('title', 'Untitled Demo'),
                    'description': metadata.get('description', ''),
                    'tags': metadata.get('tags', []),
                    'categoryId': metadata.get('categoryId', '22')
                },
                'status': {
                    'privacyStatus': privacy_status
                }
            }

            media = MediaFileUpload(video_path, chunksize=-1, resumable=True)

            request = self.youtube.videos().insert(
                part=",".join(body.keys()),
                body=body,
                media_body=media
            )
            
            response = None
            print("Uploading file... Please wait.")
            while response is None:
                status, response = request.next_chunk()
                if status:
                    print(f"Uploaded {int(status.progress() * 100)}%")

            print(f"Upload Complete! Video ID: {response.get('id')}")
            youtube_url = f"https://youtu.be/{response.get('id')}"
            print(f"URL: {youtube_url}")
            return youtube_url
            
        except Exception as e:
            print(f"An error occurred during upload: {e}")
            return None

if __name__ == "__main__":
    # Test stub
    uploader = YouTubeUploader()
    # uploader.upload("final_demo.mp4", uploader.generate_metadata("Test", "Test"))
