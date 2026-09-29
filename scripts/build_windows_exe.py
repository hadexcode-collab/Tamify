#!/usr/bin/env python3
import subprocess
import sys

if __name__ == "__main__":
    ret = subprocess.call(["node", "scripts/build_windows_suite.mjs"])
    sys.exit(ret)
