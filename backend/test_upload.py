import requests
import json
import base64

# A minimal valid PDF file base64 encoded
pdf_b64 = b"JVBERi0xLjcKCjEgMCBvYmogICUKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmogICUKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqICAlCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSCSAgICAgIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmogICUKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlCjw8IC9MZW5ndGggNDUgPj4Kc3RyZWFtCkJUCi9GMSAxOCBUZgoyMCAxMDAgVGQKKEhlbGxvLCB0aGlzIGlzIGEgdGVzdCBQREYhKSBUagoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNjkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzE5IDAwMDAwIG4gCjAwMDAwMDA0MDkgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNTA1CiUlRU9GCg=="
pdf_bytes = base64.b64decode(pdf_b64)

files = {'files': ('test_doc.pdf', pdf_bytes)}
url = 'http://127.0.0.1:8000/api/documents/upload'
print("Uploading PDF file...")
response = requests.post(url, files=files)
print(response.json())

# Fetch and print status
print("\nFetching docs...")
docs = requests.get('http://127.0.0.1:8000/api/documents/').json()
print(json.dumps([d for d in docs['documents'] if d['filename'] == 'test_doc.pdf'], indent=2))
