import mss
import cv2
import numpy as np
import time
import threading

class ScreenRecorder:
    def __init__(self, output_filename="demo_agent/outputs/recording.mp4", fps=20.0):
        self.output_filename = output_filename
        self.fps = fps
        self.is_recording = False
        self.thread = None
        self.sct = mss.mss()
        monitor = self.sct.monitors[1]
        self.width = monitor["width"]
        self.height = monitor["height"]
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        self.out = cv2.VideoWriter(self.output_filename, fourcc, self.fps, (self.width, self.height))

    def _record(self):
        monitor = self.sct.monitors[1]
        while self.is_recording:
            start_time = time.time()
            img = np.array(self.sct.grab(monitor))
            # Convert BGRA to BGR
            frame = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
            self.out.write(frame)
            
            # Try to maintain the frame rate
            elapsed_time = time.time() - start_time
            sleep_time = max(1.0 / self.fps - elapsed_time, 0)
            time.sleep(sleep_time)

    def start(self):
        print(f"Starting recording to {self.output_filename}")
        self.is_recording = True
        self.thread = threading.Thread(target=self._record)
        self.thread.start()

    def stop(self):
        print("Stopping recording")
        self.is_recording = False
        if self.thread:
            self.thread.join()
        self.out.release()

if __name__ == "__main__":
    recorder = ScreenRecorder()
    recorder.start()
    time.sleep(5) # Record for 5 seconds
    recorder.stop()
    print("Recording saved.")
