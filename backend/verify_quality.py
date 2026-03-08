import urllib.request
import json
import time

def q(msg):
    url = 'http://127.0.0.1:8000/api/chat/'
    data = json.dumps({'query': msg}).encode()
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            print(f"Q: {msg}")
            print(f"A: {res['answer']}")
            print(f"Sources: {len(res.get('sources', []))}")
            print("-" * 30)
    except Exception as e:
        print(f"Error querying '{msg}': {e}")

if __name__ == "__main__":
    print("\n--- RAG Quality Verification ---\n")
    q("What is this Neural Chat about?") # Should provide a general answer/fallback
    q("hi") # Should provide a greeting fallback
    q("Summarize the Q4 financial report") # Should provide a deep answer from docs
    q("Who is Orion Data Solutions?") # Should provide an answer from the Vendor Contract
