
const { getStorage, ref, uploadBytes, getDownloadURL,deleteObject  } = require("firebase/storage");

async function uploadToFirebaseStorage(file, fileName) {
    const modifiedFileName = `files/${new Date().toISOString()}${fileName}`;
    const storage = getStorage();
    const storageRef = ref(storage, modifiedFileName);
    await uploadBytes(storageRef, file);
    const returnedUrl = await getDownloadURL(ref(storage, modifiedFileName));
    return returnedUrl;
}

async function deleteFromStorage(fileName) {

    const storage = getStorage();
    const fileRef = ref(storage, fileName);
    await deleteObject(fileRef);
}

module.exports = {
    uploadToFirebaseStorage,
    deleteFromStorage
};