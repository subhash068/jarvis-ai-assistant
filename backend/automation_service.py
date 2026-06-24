import os
import subprocess
import webbrowser

class AutomationService:
    @staticmethod
    def execute_app(app_name: str) -> str:
        """
        Safely map an app name to a system command and execute it.
        Returns a response string to be spoken back to the user.
        """
        app = app_name.lower().strip()
        
        # Helpful aliases for apps whose spoken names don't match their executables
        aliases = {
            "google chrome": "chrome",
            "vs code": "code",
            "vscode": "code",
            "microsoft edge": "msedge",
            "edge": "msedge",
            "word": "winword",
            "powerpoint": "powerpnt",
            "excel": "excel",
            "calculator": "calc",
        }
        
        # Resolve alias if it exists, otherwise use what the user asked for
        cmd_name = aliases.get(app, app)
        
        # Basic sanitization to prevent command injection
        import re
        cmd_name = re.sub(r'[&|;<>()^]', '', cmd_name).strip()
        
        if not cmd_name:
            return "Invalid application name."
                
        try:
            # Launch the process detached using the Windows 'start' command
            os.system(f'start {cmd_name}')
            return f"Opening {app_name.title()} for you now."
        except Exception as e:
            return f"I tried to open {app_name.title()}, but encountered an error."

    @staticmethod
    def execute_browser_action(action: str, query: str = None) -> str:
        """
        Executes basic browser actions using Python's webbrowser module.
        Returns a status string.
        """
        if action == "search" and query:
            import urllib.parse
            search_url = f"https://www.google.com/search?q={urllib.parse.quote(query)}"
            webbrowser.open_new_tab(search_url)
            return f"Searching the web for '{query}'"
        elif action == "open_url" and query:
            url = query if query.startswith("http") else f"https://{query}"
            webbrowser.open_new_tab(url)
            return f"Opening {url}"
        elif action == "Open new tab":
            webbrowser.open_new_tab("https://google.com")
            return "Opened new browser tab."
        else:
            return "I'm not sure how to perform that browser action."

    @staticmethod
    async def execute_advanced_browser_action(instruction: str) -> str:
        import sys
        
        # Check if playwright is actually installed to prevent hard crash
        try:
            import playwright
        except ImportError:
            return "Playwright is not installed due to disk space limits. Please clear some space and run 'pip install playwright'."

        from llm_service import client, MODELS
        import tempfile
        import os
        import subprocess

        workspace_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "workspace")
        os.makedirs(workspace_dir, exist_ok=True)
        temp_file = os.path.join(workspace_dir, "temp_browser_task.py")
        result_file = os.path.join(workspace_dir, "task_result.txt")
        
        # Clean up old result file if it exists
        if os.path.exists(result_file):
            os.remove(result_file)

        prompt = f"""
        You are an expert Playwright automation engineer.
        Write a Python script using the playwright sync_api to perform the following task:
        "{instruction}"
        
        The script should:
        1. Include all necessary imports. Specifically, import: `from playwright.sync_api import sync_playwright`
        2. Launch chromium in headless=False mode (so the user can see it).
        3. Perform the requested task.
        4. CRITICAL: Use robust selectors. For search inputs, prefer `page.locator('input[type="search"], input[name="q"], input[name="search"]').first` or try multiple fallback locators. Do not rely strictly on exact placeholder text like 'Search Wikipedia' because placeholders change often.
        5. CRITICAL: Avoid strict mode violations. Always chain `.first` to locators that might match multiple elements before interacting with them.
        6. TIP: For search boxes, typing the query and pressing the Enter key (e.g., `element.press("Enter")`) is far more robust than attempting to locate and click a search button.
        7. TIP: When looking for links to click, AVOID generic `page.locator("a").first`. The first link on a page is often a hidden accessibility link (like "Jump to content") which Playwright cannot click because it is outside the viewport. Instead, target links inside paragraphs or main content areas, like `page.locator("p a").first` or `page.locator("main a").first`. You can also use `.click(force=True)` if a link is technically outside the viewport but you need to click it anyway.
        8. When the task is successfully completed, write the string "TASK_COMPLETED: <summary>" to a file named '{result_file.replace(chr(92), "/")}'.
        9. CRITICAL: At the very end of the script, you MUST keep the browser open until the user manually closes it by adding: `page.wait_for_event("close", timeout=0)`. If you used a different variable for the page, use that variable.
        10. Do NOT output markdown formatting like ```python. Just the raw code.
        """
        
        try:
            response = await client.chat.completions.create(
                model=MODELS["reasoning"],
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            code = response.choices[0].message.content.strip()
            
            import re
            # Extract code from markdown blocks if present
            match = re.search(r'```(?:python)?\s*(.*?)\s*```', code, re.DOTALL)
            if match:
                code = match.group(1)
            
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(code.strip())
                
            # Launch the script in the background
            process = subprocess.Popen([sys.executable, temp_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Poll the result file for up to 60 seconds
            import time
            import asyncio
            
            for _ in range(60):
                if os.path.exists(result_file):
                    with open(result_file, "r", encoding="utf-8") as f:
                        result_text = f.read().strip()
                    if result_text.startswith("TASK_COMPLETED"):
                        return f"Success:\n{result_text}"
                
                # Check if the process crashed prematurely
                if process.poll() is not None:
                    stdout, stderr = process.communicate()
                    return f"Error executing playwright script: Process exited prematurely.\nSTDOUT: {stdout}\nSTDERR: {stderr}"
                    
                await asyncio.sleep(1)
                
                # If we reach here, it timed out
            process.terminate()
            return "Error: Script execution timed out after 60 seconds."
        except Exception as e:
            return f"Failed to execute advanced browser action: {str(e)}"

    @staticmethod
    async def execute_advanced_computer_action(instruction: str) -> str:
        """
        Executes an advanced computer automation task by generating and running a python script
        using pyautogui, os, or subprocess.
        """
        import sys
        
        # Check if pyautogui is installed
        try:
            import pyautogui
        except ImportError:
            return "PyAutoGUI is not installed. Please run 'pip install pyautogui keyboard' to enable PC control."

        from llm_service import client, MODELS
        import tempfile
        import os
        import subprocess

        workspace_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "workspace")
        os.makedirs(workspace_dir, exist_ok=True)
        temp_file = os.path.join(workspace_dir, "temp_pc_task.py")
        result_file = os.path.join(workspace_dir, "pc_task_result.txt")
        
        # Clean up old result file if it exists
        if os.path.exists(result_file):
            os.remove(result_file)

        prompt = f"""
        You are an expert PC Automation engineer.
        Write a Python script to perform the following system task:
        "{instruction}"
        
        The script should:
        1. Include necessary imports, e.g., `import pyautogui`, `import time`, `import subprocess`, `import os`.
        2. PREFER native Python modules (`os`, `shutil`, `pathlib`, `subprocess`) for file system operations, launching applications, or system settings. GUI automation is brittle. ONLY use `pyautogui` for interactions that cannot be done programmatically via native modules.
        3. CRITICAL: For file operations (like creating folders), use `os.makedirs` or `pathlib` directly instead of `subprocess.run(['mkdir', ...])`. If you MUST run a shell built-in on Windows via subprocess, you MUST pass `shell=True`.
        4. Set `pyautogui.FAILSAFE = False` (this is critical to avoid crashes if mouse is at the edge) and use a reasonable `pyautogui.PAUSE` if clicking/typing to avoid missing UI elements.
        5. Use sleep where necessary to allow the OS or apps to catch up before typing or clicking.
        6. When the task is successfully completed, write the string "TASK_COMPLETED: <summary>" to a file named '{result_file.replace(chr(92), "/")}'.
        7. Do NOT output markdown formatting like ```python. Just the raw code. Do NOT provide any explanation outside the code.
        """
        
        try:
            response = await client.chat.completions.create(
                model=MODELS["reasoning"],
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2
            )
            code = response.choices[0].message.content.strip()
            
            import re
            # Extract code from markdown blocks if present
            match = re.search(r'```(?:python)?\s*(.*?)\s*```', code, re.DOTALL)
            if match:
                code = match.group(1)
            
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(code.strip())
                
            # Launch the script in the background
            process = subprocess.Popen([sys.executable, temp_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            
            # Poll the result file for up to 60 seconds
            import time
            import asyncio
            
            for _ in range(60):
                if os.path.exists(result_file):
                    with open(result_file, "r", encoding="utf-8") as f:
                        result_text = f.read().strip()
                    if result_text.startswith("TASK_COMPLETED"):
                        return f"Success:\n{result_text}"
                
                # Check if the process crashed prematurely
                if process.poll() is not None:
                    stdout, stderr = process.communicate()
                    return f"Error executing PC automation script: Process exited prematurely.\nSTDOUT: {stdout}\nSTDERR: {stderr}"
                    
                await asyncio.sleep(1)
                
            # If we reach here, it timed out
            process.terminate()
            return "Error: Script execution timed out after 60 seconds."
        except Exception as e:
            return f"Failed to execute advanced computer action: {str(e)}"
