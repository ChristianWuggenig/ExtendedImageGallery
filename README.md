# ExtendedImageGallery

### To install/prepare running the app
```
~/ExtendendImageGallery$ cd client
~/ExtendendImageGallery/client$ npm install 
~/ExtendendImageGallery/client$ cd ../server
~/ExtendendImageGallery/server$ npm install
```
### To start the app
On server: `~/ExtendendImageGallery/server$ npm start`

On client: `~/ExtendendImageGallery/client$ ng serve`

### Regarding DB
This app uses a sqlite3 DB on the server. So there is no need to run a DB server. DB file gallery.db is included.
Image files are not included in public repo. To test with the public code, 
the image files from the course gallery need to be put in `server/public/img`. 
Images of size `3000x2000` and `320x213` work best.
