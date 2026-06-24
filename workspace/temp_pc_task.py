import os
import subprocess
import time
import pyautogui

pyautogui.FAILSAFE = False
pyautogui.PAUSE = 1

def open_chrome():
    try:
        # Open Chrome
        chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
        if os.path.exists(chrome_path):
            subprocess.run([chrome_path])
        else:
            # If Chrome is not installed in the default location, try to find it in the PATH
            subprocess.run(["start", "chrome"], shell=True)
        
        time.sleep(5)  # Wait for Chrome to open
        
        # Write the result to the file
        with open('C:/Users/windows-11/Desktop/jarvis-ai-assistant/workspace/pc_task_result.txt', 'w') as f:
            f.write("TASK_COMPLETED: Chrome opened successfully")
        
    except Exception as e:
        # Write the error to the file
        with open('C:/Users/windows-11/Desktop/jarvis-ai-assistant/workspace/pc_task_result.txt', 'w') as f:
            f.write(f"TASK_FAILED: {str(e)}")

if __name__ == "__main__":
    open_chrome()