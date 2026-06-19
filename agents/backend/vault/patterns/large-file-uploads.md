# Large File Uploads

Never load an entire large file into memory — it blocks the server and exhausts RAM.

## Patterns
- **Chunked uploads**: client slices the file; backend appends chunks sequentially at calculated byte offsets to disk or cloud storage.
- **Streaming reads**: for single-request uploads, read the request stream in fixed chunks (~5MB) and stream straight to disk or cloud storage — bypass memory loading.
- **Direct-to-bucket**: prefer uploading large files directly to a cloud bucket (e.g. S3) via a one-time presigned URL for upload/download.
