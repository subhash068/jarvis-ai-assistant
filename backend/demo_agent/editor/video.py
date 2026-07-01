import os
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip

class VideoEditor:
    def __init__(self, video_path: str, audio_timeline: list, output_path: str):
        self.video_path = video_path
        self.audio_timeline = audio_timeline
        self.output_path = output_path
        
    def compile_video(self):
        """
        Uses MoviePy to merge the recorded video with the TTS audio timeline.
        """
        print(f"Compiling video {self.video_path} into {self.output_path}...")
        
        # Load the raw video
        if not os.path.exists(self.video_path):
            print(f"Error: Video file {self.video_path} not found.")
            return

        try:
            video = VideoFileClip(self.video_path)
            
            # Load all audio clips and set their start times
            audio_clips = []
            
            # Optionally, if the raw video has its own audio we want to keep:
            # if video.audio is not None:
            #     audio_clips.append(video.audio)
                
            for entry in self.audio_timeline:
                audio_file = entry.get("audio_file")
                start_time = entry.get("start_time", 0.0)
                
                if os.path.exists(audio_file):
                    clip = AudioFileClip(audio_file)
                    if hasattr(clip, "with_start"):
                        clip = clip.with_start(start_time)
                    else:
                        clip = clip.set_start(start_time)
                    audio_clips.append(clip)
                else:
                    print(f"Warning: Audio file {audio_file} not found.")
            
            # Combine all audio clips
            if audio_clips:
                final_audio = CompositeAudioClip(audio_clips)
                if hasattr(video, "with_audio"):
                    final_video = video.with_audio(final_audio)
                else:
                    final_video = video.set_audio(final_audio)
            else:
                final_video = video
                
            # Write the result to a file
            final_video.write_videofile(
                self.output_path, 
                codec="libx264", 
                audio_codec="aac", 
                temp_audiofile="temp-audio.m4a", 
                remove_temp=True, 
                fps=24
            )
            print("Video compilation complete.")
            
        except Exception as e:
            print(f"Error during video compilation: {e}")

if __name__ == "__main__":
    # Test stub
    editor = VideoEditor("demo.mp4", [{"audio_file": "test_audio.mp3", "start_time": 0.0}], "final_demo.mp4")
    # editor.compile_video() # Will fail without actual files
