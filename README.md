# Lazy Dropbox -- Resume Version

Lazy Dropbox is an extension app for Dropbox that allows reading and writing to selectively sync'd files directly in the cloud. Most importantly, these files are accessible to other apps, like Finder. It does this by connecting native file system calls to Dropbox API endpoints via FUSE (file system in user space), which enables initializing a virtual file system and customizing its methods.

## Set-up:

1. Enter user information into index.js:

  accessToken: specific user token from Dropbox API (available here: https://www.dropbox.com/developers/reference/oauth-guide)

  mountPath: directory location for virtual file system. Note: this MUST be located outside of your Dropbox folder.

  dbxOrigin: directory location for selectively sync'd folders inside your Dropbox folder. Note: this should lead with a '/' and should NOT include the root directory.

2. run index.js from node

## Primary Dependencies:

This app utilizes the following libraries:
- Node.js (FS, HTTPS, PATH, and BUFFER)
- Dropbox API
- FUSE (File System in User Space) library with JavaScript bindings

## Highlights

- mountTree.42-66: readdir accepts an array of file names as an argument; these are generated directly from the Dropbox API "filesGetMetadata" endpoint, which returns a nested object of information, including (up to 100) individual file names. This snippet aggregates file names and also uses a recursive call to the endpoint within a while-loop in the event of 100+ file names.
- mountTree.84-106: while "read" is not yet functional, this implementation loads files 65536 bytes at a time from the cloud via a temporary buffer. One way to optimize it is to keep temporary versions of requested files in local state so as to alleviate the bottleneck at line 86.
- mountTree.144-146: not a big deal really, but the FUSE function is much longer than I typically like to keep on a single page. The above "ops" function, as well as exporting the result to index.js, are two ways to keep the code more readable.
