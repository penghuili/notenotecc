import SparkMD5 from 'spark-md5';

export async function md5(data) {
  if (typeof data === 'string') {
    return SparkMD5.hash(data);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      const fileData = e.target.result;
      const md5Hash = SparkMD5.ArrayBuffer.hash(fileData);
      resolve(md5Hash);
    };

    reader.onerror = function (e) {
      reject(e.target.error);
    };

    reader.readAsArrayBuffer(data);
  });
}
