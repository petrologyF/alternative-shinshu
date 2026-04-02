import os

def is_mojibake(content):
    patterns = ["縺", "繝", "蟷", "蜈", "蜊", "蛻", "遘", "蟄"]
    for p in patterns:
        if p in content:
            return True
    return False

def scan_dir(start_dir):
    mojibake_files = []
    # Use absolute path if needed
    abs_start = os.path.abspath(start_dir)
    for root, dirs, files in os.walk(abs_start):
        if "node_modules" in dirs:
            dirs.remove("node_modules")
        for file in files:
            if file.endswith((".ts", ".tsx", ".js", ".jsx")):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                        if is_mojibake(content):
                            mojibake_files.append(path)
                except Exception as e:
                    pass
    return mojibake_files

if __name__ == "__main__":
    files = scan_dir("frontend/src")
    for f in files:
        print(f)
