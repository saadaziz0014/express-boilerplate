const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
});

const uploadImageToS3 = async (file, folder) => {
  console.log(file, 'file');
  if(folder){
    var key = folder + (new Date().getTime()) + file.originalname;
  }else{
    var key = (new Date().getTime()) + file.originalname;
  }
  console.log(key, 'key');
  let params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ACL: "public-read",
  };

  try {
    await new AWS.S3().putObject(params).promise();

    return Promise.resolve({
      imageUrl: key,
    });

  } catch (e) {}

  return null;
};

module.exports = {
  uploadImages: uploadImageToS3
}