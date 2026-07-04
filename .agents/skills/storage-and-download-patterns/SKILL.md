---
name: storage-and-download-patterns
description: Best practices for S3 presigned URLs, Supabase Storage folder resolution, Jupyter path resolution, and permission-aware file download patterns.
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Storage and Download Patterns

This skill documents critical patterns and constraints for handling S3 bucket access, Supabase Storage listings, Jupyter notebook path resolution, and file download authentication in the MyApp ecosystem.

---

## 1. AWS S3 Client and Presigned URLs

### Signature Version and Region Defaults
When initializing AWS S3 clients for generating presigned URLs (specifically for the `myapp-datasets` bucket located in `us-east-2`), you must explicitly configure:
- **Signature Version**: Must be set to `v4` (`signatureVersion: "v4"`). AWS regions like `us-east-2` require Signature Version 4 (`AWS4-HMAC-SHA256`) to validate presigned URLs.
- **Region Fallback**: If `process.env.AWS_REGION` is undefined, default to `"us-east-2"` (instead of `"us-east-1"`).

```typescript
import AWS from "aws-sdk";

const REGION = process.env.AWS_REGION || "us-east-2";

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: REGION,
	signatureVersion: "v4", // REQUIRED
});
```

---

## 2. Supabase Storage Folder Structure

### Folder Partitioning
In Supabase Storage (`files` bucket), user objects are partitioned into different folders based on context:
- **User Notebooks**: Reside under the user's ID directory: `${userId}/` (e.g. `be74b192-87a3-498c-b562-d9427b5fb555/notebook-name`).
- **Threads/Chats**: Reside under the `threads/` directory: `threads/${threadId}`.

### Folder-Aware Listing
When fetching lists (e.g. pinned files), do not hardcode listing from the `userId` folder alone. Instead, group the files by their parent folder prefix and fetch from each unique storage path in parallel:

```typescript
// Find unique folders from database records (e.g., "threads" or "user_id")
const folders = Array.from(
	new Set(records.map((r) => r.name.split("/")[0]))
);

// Fetch files from Supabase Storage for all target folders in parallel
const filesPromises = folders.map(async (folder) => {
	const { data: folderFiles } = await sbStorage.list(folder, { limit: 1000 });
	return (folderFiles || []).map((file) => ({
		...file,
		fullName: `${folder}/${file.name}`,
	}));
});
```

### Robust Matching
Always match database records with Supabase Storage files by **ID** (`storage.id === file.id`) rather than raw names. Storage listings omit folder prefixes, whereas database records include them (e.g. comparing `"threads/uuid" === "uuid"` fails). 

---

## 3. Jupyter Notebook Path Resolution

### Path Resolution Helper
Before downloading any Jupyter Notebook, resolve its full storage path dynamically using `getFullFilePath` instead of assuming it resides under `userId/`.
- `getFullFilePath` queries the `/api/spaces/filePath` endpoint to retrieve the correct folder prefix (resolving `threads/${fileId}` vs `${userId}/${fileId}`).

```typescript
const fileId = getFileId(file);
let path = fileId;
try {
	path = await getFullFilePath(fileId);
} catch (e) {
	// Fall back to default user path if it doesn't contain a prefix
	if (!path.includes("/")) {
		path = `${user.id}/${path}`;
	}
}
```

### Jupyter Temporary File Cleanups
When a user requests a file download, temporary files are only created on the Jupyter server if the request requires rendering/conversion (e.g., to HTML, PDF, or DOCX).
- **Direct `.ipynb` Downloads**: Download directly from Supabase Storage. Do not write temporary files to the Jupyter server.
- **Cleanup Guard**: Do not send `DELETE` requests to the Jupyter contents server when downloading direct `.ipynb` files. Attempting to delete non-existent temporary files results in cluttering `404 (Not Found)` browser console errors.

```typescript
} finally {
	// Only request Jupyter contents cleanup for conversions (PDF, HTML, DOCX)
	if (fileExt !== "ipynb") {
		await ConnectionManager.getInstance().serviceManager!.contents.delete(
			fileName + "." + fileExt,
		);
	}
}
```

---

## 4. Download Authorization Checks

To verify if a user has access to download a dataset, avoid relying on restrictive direct workspace ownership checks (`spaces.creator_id === userId`). Instead, check:
1. If the caller is a `super_admin`.
2. If the caller is the creator of the dataset (`created_by === userId`).
3. If the user has inherited access to the dataset through `space_effective_privs` (matching the permissions check used to render files in the UI).

```typescript
// 1. Is creator of the dataset
if (dataset.created_by === userId) {
	hasAccess = true;
}

// 2. Has privilege via space effective privileges
const { data: privRows } = await supabaseAdmin
	.from("space_effective_privs")
	.select("effective_privs")
	.eq("subject_type", "user")
	.eq("subject_id", userId)
	.eq("object_type", "dataset")
	.eq("object_id", id)
	.gte("effective_privs", 1)
	.limit(1);
```
