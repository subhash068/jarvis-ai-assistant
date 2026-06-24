import pyautogui
import time
import subprocess
import os
import pathlib

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 1

def play_dorandar_video():
    video_path = 'C:/Users/windows-11/Videos/Dorandar.mp4'
    if not os.path.exists(video_path):
        print("Video file not found")
        return

    # Open video player
    video_player_path = 'C:/Program Files/VideoLAN/VLC/vlc.exe'
    if not os.path.exists(video_player_path):
        print("VLC media player not found")
        return

    subprocess.run([video_player_path, video_path])

    # Wait for video to start playing
    time.sleep(5)

    # Write task completion to file
    result_file_path = 'C:/Users/windows-11/Desktop/jarvis-ai-assistant/workspace/pc_task_result.txt'
    with open(result_file_path, 'w') as f:
        f.write('TASK_COMPLETED: Dorandar video played successfully')

play_dorandar_video()