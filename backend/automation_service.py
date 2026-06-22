import os
import subprocess

class AutomationService:
    @staticmethod
    def execute_app(app_name: str) -> str:
        """
        Safely map an app name to a system command and execute it.
        Returns a response string to be spoken back to the user.
        """
        app = app_name.lower().strip()
        
        # Hardcoded safe allowed list
        allowed_apps = {
            "chrome": "start chrome",
            "spotify": "start spotify",
            "notepad": "start notepad",
            "calculator": "calc",
            "explorer": "explorer",
            "edge": "start msedge",
            "vs code": "code",
            "vscode": "code"
        }
        
        # Check if the requested app is in our allowed list
        # We do simple substring matching to catch "google chrome" -> "chrome"
        matched_cmd = None
        matched_name = None
        
        for key, cmd in allowed_apps.items():
            if key in app:
                matched_cmd = cmd
                matched_name = key
                break
                
        if matched_cmd:
            try:
                # Use os.system to launch the process detached
                # In a real production app we'd use subprocess.Popen
                os.system(matched_cmd)
                return f"Opening {matched_name.title()} for you now."
            except Exception as e:
                return f"I tried to open {matched_name.title()}, but encountered an error."
        else:
            return f"I'm sorry, I don't have permission to open {app_name} or it is not recognized."
