from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import subprocess
import os

router = APIRouter(
    prefix="/testing",
    tags=["testing"]
)

class TestRequest(BaseModel):
    url: str | None = None
    browser: str | None = "chromium"
    headed: bool = False

class GenerateTestRequest(BaseModel):
    url: str
    prompt: str

class TestResponse(BaseModel):
    success: bool
    output: str

@router.post("/run", response_model=TestResponse)
async def run_tests(request: TestRequest):
    engine_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "playwright-engine")
    
    if not os.path.exists(engine_dir):
        raise HTTPException(status_code=500, detail="Playwright engine directory not found")

    cmd = ["npx", "playwright", "test"]
    
    if request.browser:
        cmd.extend(["--project", request.browser])

    if request.headed:
        cmd.append("--headed")

    try:
        # Run playwright using subprocess
        # Pass environment variables if we want to override the URL
        env = os.environ.copy()
        if request.url:
            env["PLAYWRIGHT_TEST_URL"] = request.url

        process = subprocess.run(
            cmd,
            cwd=engine_dir,
            env=env,
            capture_output=True,
            text=True,
            timeout=120, # 2 minute timeout
            shell=os.name == 'nt'
        )

        return TestResponse(
            success=process.returncode == 0,
            output=process.stdout + "\n" + process.stderr
        )
    except subprocess.TimeoutExpired as e:
        return TestResponse(
            success=False,
            output=f"Test execution timed out.\n{e.stdout}\n{e.stderr}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/codegen")
async def run_codegen(request: TestRequest):
    engine_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "playwright-engine")
    
    if not os.path.exists(engine_dir):
        raise HTTPException(status_code=500, detail="Playwright engine directory not found")

    cmd = ["npx", "playwright", "codegen", "-o", "tests/recorded.spec.ts"]
    if request.url:
        cmd.append(request.url)
    
    try:
        subprocess.Popen(
            cmd,
            cwd=engine_dir,
            shell=os.name == 'nt'
        )
        return {"success": True, "message": "Playwright Code Generator launched"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
## for QA Automation Script Generator based on jarvis
@router.post("/generate")
async def generate_test(request: GenerateTestRequest):
    from llm_service import LLMService
    
    if not request.url:
        raise HTTPException(status_code=400, detail="Target URL is required for AI generation.")
        
    engine_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "playwright-engine")
    if not os.path.exists(engine_dir):
        raise HTTPException(status_code=500, detail="Playwright engine directory not found")

    try:
        code = await LLMService.generate_playwright_test(request.prompt, request.url)
        
        # Write to tests/ai_generated.spec.ts
        tests_dir = os.path.join(engine_dir, "tests")
        os.makedirs(tests_dir, exist_ok=True)
        file_path = os.path.join(tests_dir, "ai_generated.spec.ts")
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(code)
            
        return {"success": True, "message": "Playwright test generated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
